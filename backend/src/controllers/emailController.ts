/**
 * Email Controller
 * Handles CRUD operations for monitored email addresses
 */

import { Request, Response } from "express";
import Email, { IEmail } from "../models/Email";
import { XposedOrNotService } from "../services/xposedOrNotService";
import { createNotificationWithEmail } from "./notificationController";

/**
 * Get all monitored emails for a user
 * GET /api/emails
 */
export const getEmails = async (req: Request, res: Response): Promise<void> => {
  try {
    // Try both lowercase and original case for header
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;

    if (!userId) {
      console.error(
        "Missing user-id header. Received headers:",
        Object.keys(req.headers)
      );
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    // Ensure the signed-in email (userId) is always in the monitored emails list
    const signedInEmail = userId.toLowerCase().trim();
    const existingSignedInEmail = await Email.findOne({
      userId,
      email: signedInEmail,
    });

    // If the signed-in email is not in the database, automatically add it
    if (!existingSignedInEmail) {
      console.log(
        `📧 Auto-adding signed-in email to monitored list: ${signedInEmail}`
      );

      // Create the signed-in email document immediately (without breach check to avoid delay)
      // Breach check will happen in the background
      const newSignedInEmail = new Email({
        userId,
        email: signedInEmail,
        status: "safe", // Default status, will be updated after breach check
        breaches: 0,
        breachData: null,
        addedDate: new Date(),
        lastChecked: new Date(),
      });

      await newSignedInEmail.save();
      console.log(`Signed-in email automatically added to monitored list`);

      // Check for breaches asynchronously (don't wait for it)
      (async () => {
        try {
          console.log(
            `Checking breaches for signed-in email: ${signedInEmail}`
          );
          const analytics = await XposedOrNotService.getBreachAnalytics(
            signedInEmail
          );
          const riskScore = XposedOrNotService.calculateRiskScore(analytics);

          // Extract breach details (reuse logic from addEmail)
          const breachDetails =
            analytics.ExposedBreaches?.breaches_details || [];
          const breachSummary = analytics.BreachesSummary;
          const breachMetrics = analytics.BreachMetrics;

          // Format yearly data
          const yearlyData = breachMetrics?.yearwise_details?.[0] || {};
          const yearHistory = Object.entries(yearlyData)
            .filter(([key]) => key.startsWith("y"))
            .map(([key, value]) => ({
              year: parseInt(key.replace("y", "")),
              count: value as number,
            }))
            .sort((a, b) => a.year - b.year);

          const breachData = {
            success: true,
            email: signedInEmail,
            riskScore: riskScore,
            breachCount: breachDetails.length,
            breachSummary: breachSummary,
            breaches: breachDetails.map((breach: any) => {
              // Extract exposed data - handle both array and string formats
              let exposedDataArray: string[] | undefined;

              if (Array.isArray(breach.exposedData)) {
                exposedDataArray = breach.exposedData;
              } else if (typeof breach.exposedData === "string") {
                const exposedDataStr = breach.exposedData as string;
                exposedDataArray = exposedDataStr
                  .split(";")
                  .map((item: string) => item.trim())
                  .filter((item: string) => item.length > 0);
              }

              // Extract date from various fields
              let breachDate: string | undefined = breach.breachedDate;
              if (!breachDate && breach.details) {
                const dateMatch = breach.details.match(
                  /(\d{4}-\d{2}-\d{2}|\w+\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/
                );
                if (dateMatch) {
                  breachDate = dateMatch[1];
                }
              }

              // Extract logo URL
              let logoUrl: string | undefined = undefined;
              if (breach.logo) {
                if (breach.logo.startsWith("http")) {
                  logoUrl = breach.logo;
                } else if (breach.logo.startsWith("/")) {
                  logoUrl = `https://xposedornot.com${breach.logo}`;
                }
              }

              return {
                name: breach.name || breach["Breach Name"] || "Unknown Breach",
                description:
                  breach.details ||
                  breach.description ||
                  breach.exposureDescription ||
                  breach["Description"] ||
                  "",
                breachedDate: breachDate,
                exposedData: exposedDataArray || [],
                domain: breach.domain || breach["Domain"] || undefined,
                industry: breach.industry || breach["Industry"] || undefined,
                affectedAccounts:
                  breach.affectedAccounts ||
                  breach["Affected Accounts"] ||
                  breach["Exposed Records"] ||
                  undefined,
                passwordRisk:
                  breach.passwordRisk || breach["Password Risk"] || undefined,
                verified:
                  breach.verified !== undefined
                    ? breach.verified
                    : breach.Verified === "Yes"
                    ? true
                    : breach.Verified === "No"
                    ? false
                    : undefined,
                logo: logoUrl || undefined,
                referenceURL:
                  breach.referenceURL || breach["Reference URL"] || undefined,
                searchable:
                  breach.searchable !== undefined
                    ? breach.searchable
                    : breach.Searchable === "Yes"
                    ? true
                    : breach.Searchable === "No"
                    ? false
                    : undefined,
                sensitive:
                  breach.sensitive !== undefined
                    ? breach.sensitive
                    : breach.Sensitive === "Yes"
                    ? true
                    : breach.Sensitive === "No"
                    ? false
                    : undefined,
              };
            }),
            metrics: {
              risk: breachMetrics?.risk?.[0],
              passwordStrength: breachMetrics?.passwords_strength?.[0],
              industry: breachMetrics?.industry,
              exposedDataTypes: breachMetrics?.xposed_data,
            },
            yearHistory: yearHistory,
            pastes: analytics.PastesSummary,
          };
          const breaches = breachDetails.length;
          const status = breaches > 0 ? "breached" : "safe";
          console.log(
            `✅ Breach check completed for signed-in email: ${breaches} breaches found`
          );

          // Update the email document with breach data
          await Email.findByIdAndUpdate(newSignedInEmail._id, {
            status,
            breaches,
            breachData,
            lastChecked: new Date(),
          });

          // Create notification if breaches were detected
          if (breaches > 0 && breachData) {
            try {
              const breachNames = breachData.breaches
                ? (breachData.breaches as any[])
                    .map((b: any) => b.name || "Unknown Breach")
                    .slice(0, 5)
                : [];

              await createNotificationWithEmail(
                userId,
                "breach",
                "New breach detected",
                `Your email was found in ${breaches} data breach${
                  breaches > 1 ? "es" : ""
                }`,
                {
                  email: signedInEmail,
                  breachCount: breaches,
                  breachNames: breachNames,
                }
              );
            } catch (error) {
              console.error("Error creating breach notification:", error);
            }
          }
        } catch (error) {
          console.warn(
            `⚠️  Error checking breaches for signed-in email ${signedInEmail}: ${
              error instanceof Error ? error.message : "Unknown error"
            }. Email saved without breach data.`
          );
        }
      })();
    }

    const emails = await Email.find({ userId }).sort({ addedDate: -1 });

    res.status(200).json({
      success: true,
      emails: emails.map((email) => ({
        id: email._id.toString(),
        email: email.email,
        status: email.status,
        breaches: email.breaches,
        addedDate: email.addedDate.toISOString(),
        breachData: email.breachData || null,
        lastChecked: email.lastChecked?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch emails",
    });
  }
};

/**
 * Add a new monitored email
 * POST /api/emails
 */
export const addEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    // Try both lowercase and original case for header
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;
    const { email } = req.body;

    if (!userId) {
      console.error(
        "Missing user-id header. Received headers:",
        Object.keys(req.headers)
      );
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    if (!email) {
      res.status(400).json({
        success: false,
        error: "Email is required",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
      return;
    }

    // Check if email already exists for this user
    const existingEmail = await Email.findOne({
      userId,
      email: email.toLowerCase().trim(),
    });

    if (existingEmail) {
      res.status(409).json({
        success: false,
        error: "This email is already being monitored",
      });
      return;
    }

    // Check for breaches using the breach service
    let breachData = null;
    let status: "safe" | "breached" = "safe";
    let breaches = 0;

    try {
      console.log(`Checking breaches for email: ${email}`);
      const analytics = await XposedOrNotService.getBreachAnalytics(email);
      const riskScore = XposedOrNotService.calculateRiskScore(analytics);

      // Extract breach details
      const breachDetails = analytics.ExposedBreaches?.breaches_details || [];
      const breachSummary = analytics.BreachesSummary;
      const breachMetrics = analytics.BreachMetrics;

      // Log first breach for debugging - show all available fields
      if (breachDetails.length > 0) {
        console.log("=".repeat(80));
        console.log("RAW BREACH DATA FROM API (First Breach):");
        console.log("=".repeat(80));
        console.log(JSON.stringify(breachDetails[0], null, 2));
        console.log("Available keys:", Object.keys(breachDetails[0]));
        console.log("Has breachedDate:", !!breachDetails[0].breachedDate);
        console.log("Has exposedData:", !!breachDetails[0].exposedData);
        console.log("exposedData type:", typeof breachDetails[0].exposedData);
        console.log("exposedData value:", breachDetails[0].exposedData);
        console.log("Has details:", !!breachDetails[0].details);
        console.log(
          "Has exposureDescription:",
          !!breachDetails[0].exposureDescription
        );
        console.log("Has logo:", !!breachDetails[0].logo);
        console.log("Logo value:", breachDetails[0].logo);
        console.log("=".repeat(80));
      }

      // Format yearly data
      const yearlyData = breachMetrics?.yearwise_details?.[0] || {};
      const yearHistory = Object.entries(yearlyData)
        .filter(([key]) => key.startsWith("y"))
        .map(([key, value]) => ({
          year: parseInt(key.replace("y", "")),
          count: value as number,
        }))
        .sort((a, b) => a.year - b.year);

      breachData = {
        success: true,
        email: email,
        riskScore: riskScore,
        breachCount: breachDetails.length,
        breachSummary: breachSummary,
        breaches: breachDetails.map((breach: any) => {
          // Extract exposed data - handle both array and string formats
          let exposedDataArray: string[] | undefined;

          if (Array.isArray(breach.exposedData)) {
            exposedDataArray = breach.exposedData;
          } else if (typeof breach.exposedData === "string") {
            // If exposedData is a string (semicolon-separated), convert to array
            const exposedDataStr = breach.exposedData as string;
            exposedDataArray = exposedDataStr
              .split(";")
              .map((item: string) => item.trim())
              .filter((item: string) => item.length > 0);
          }

          // If still no exposed data, try to get from xposed_data in metrics
          if (!exposedDataArray || exposedDataArray.length === 0) {
            if (
              breachMetrics?.xposed_data &&
              Array.isArray(breachMetrics.xposed_data)
            ) {
              // Extract from nested structure
              const extractDataTypes = (data: any): string[] => {
                const types: string[] = [];
                if (Array.isArray(data)) {
                  data.forEach((item: any) => {
                    if (item?.children) {
                      item.children.forEach((child: any) => {
                        if (child?.children) {
                          child.children.forEach((leaf: any) => {
                            if (leaf?.name && leaf.name.startsWith("data_")) {
                              types.push(
                                leaf.name
                                  .replace("data_", "")
                                  .replace(/_/g, " ")
                              );
                            }
                          });
                        }
                      });
                    }
                  });
                }
                return types;
              };
              exposedDataArray = extractDataTypes(breachMetrics.xposed_data);
            }
          }

          // Construct logo URL - handle both relative and absolute paths
          let logoUrl = breach.logo;
          if (logoUrl && !logoUrl.startsWith("http")) {
            // If it's a relative path or filename, construct full URL
            if (logoUrl.startsWith("/")) {
              logoUrl = `https://xposedornot.com${logoUrl}`;
            } else {
              logoUrl = `https://xposedornot.com/static/logos/${logoUrl}`;
            }
          }

          // Extract date - handle multiple formats
          let breachDate = breach.breachedDate;
          if (!breachDate && breach.details) {
            // Try to extract date from description
            const dateMatch = breach.details.match(/\b(\d{4}-\d{2}-\d{2})\b/);
            if (dateMatch) {
              breachDate = dateMatch[1];
            }
          }

          return {
            name:
              breach.breach ||
              breach.breachID ||
              breach["Breach ID"] ||
              "Unknown Breach",
            domain: breach.domain || breach.Domain || undefined,
            date: breachDate || breach["Breached Date"] || undefined,
            exposedData:
              exposedDataArray && exposedDataArray.length > 0
                ? exposedDataArray
                : undefined,
            exposedRecords:
              breach.exposedRecords || breach["Exposed Records"] || undefined,
            description:
              breach.exposureDescription ||
              breach.details ||
              breach["Exposure Description"] ||
              undefined,
            industry: breach.industry || breach.Industry || undefined,
            passwordRisk:
              breach.passwordRisk || breach["Password Risk"] || undefined,
            verified:
              breach.verified !== undefined
                ? breach.verified
                : breach.Verified === "Yes"
                ? true
                : breach.Verified === "No"
                ? false
                : undefined,
            logo: logoUrl || undefined,
            referenceURL:
              breach.referenceURL || breach["Reference URL"] || undefined,
            searchable:
              breach.searchable !== undefined
                ? breach.searchable
                : breach.Searchable === "Yes"
                ? true
                : breach.Searchable === "No"
                ? false
                : undefined,
            sensitive:
              breach.sensitive !== undefined
                ? breach.sensitive
                : breach.Sensitive === "Yes"
                ? true
                : breach.Sensitive === "No"
                ? false
                : undefined,
          };
        }),
        metrics: {
          risk: breachMetrics?.risk?.[0],
          passwordStrength: breachMetrics?.passwords_strength?.[0],
          industry: breachMetrics?.industry,
          exposedDataTypes: breachMetrics?.xposed_data,
        },
        yearHistory: yearHistory,
        pastes: analytics.PastesSummary,
      };
      breaches = breachDetails.length;
      status = breaches > 0 ? "breached" : "safe";
      console.log(`Breach check completed: ${breaches} breaches found`);
    } catch (error) {
      // Log error but don't fail the request - email will be saved without breach data
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("timeout")) {
        console.warn(
          `Breach check timeout for ${email}. Email saved without breach data.`
        );
      } else {
        console.warn(
          `Error checking breaches for ${email}: ${errorMessage}. Email saved without breach data.`
        );
      }
      // Continue to save email even if breach check fails
      // User can manually check later using the "Check" button
    }

    // Create new email document
    const newEmail = new Email({
      userId,
      email: email.toLowerCase().trim(),
      status,
      breaches,
      breachData,
      addedDate: new Date(),
      lastChecked: new Date(),
    });

    await newEmail.save();

    // Create notification if breaches were detected
    if (breaches > 0 && breachData) {
      try {
        const breachNames = breachData.breaches
          ? (breachData.breaches as any[])
              .map((b: any) => b.name || "Unknown Breach")
              .slice(0, 5)
          : [];

        await createNotificationWithEmail(
          userId,
          "breach",
          "New breach detected",
          `Your email was found in ${breaches} data breach${
            breaches > 1 ? "es" : ""
          }`,
          {
            email: email.toLowerCase().trim(),
            breachCount: breaches,
            breachNames: breachNames,
          }
        );
      } catch (error) {
        console.error("Error creating breach notification:", error);
        // Don't fail the request if notification creation fails
      }
    }

    res.status(201).json({
      success: true,
      email: {
        id: newEmail._id.toString(),
        email: newEmail.email,
        status: newEmail.status,
        breaches: newEmail.breaches,
        addedDate: newEmail.addedDate.toISOString(),
        breachData: newEmail.breachData || null,
        lastChecked: newEmail.lastChecked?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error adding email:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        error: "This email is already being monitored",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Failed to add email",
    });
  }
};

/**
 * Delete a monitored email
 * DELETE /api/emails/:id
 */
export const deleteEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Try both lowercase and original case for header
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;
    const { id } = req.params;

    if (!userId) {
      console.error(
        "Missing user-id header. Received headers:",
        Object.keys(req.headers)
      );
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    // First, find the email to check if it's the primary account
    const email = await Email.findOne({
      _id: id,
      userId, // Ensure user can only access their own emails
    });

    if (!email) {
      res.status(404).json({
        success: false,
        error: "Email not found",
      });
      return;
    }

    // Prevent deletion of the signed-in Google account (primary account)
    // The userId is the signed-in email address
    if (email.email.toLowerCase() === userId.toLowerCase()) {
      res.status(403).json({
        success: false,
        error:
          "Cannot remove your signed-in Google account. This is your primary account.",
      });
      return;
    }

    // Delete the email
    await Email.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Email removed successfully",
    });
  } catch (error) {
    console.error("Error deleting email:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete email",
    });
  }
};

/**
 * Update breach data for an email
 * PUT /api/emails/:id/check
 */
export const checkEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Try both lowercase and original case for header
    const userId = (req.headers["user-id"] || req.headers["User-Id"]) as string;
    const { id } = req.params;

    if (!userId) {
      console.error(
        "Missing user-id header. Received headers:",
        Object.keys(req.headers)
      );
      res.status(401).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    const email = await Email.findOne({
      _id: id,
      userId,
    });

    if (!email) {
      res.status(404).json({
        success: false,
        error: "Email not found",
      });
      return;
    }

    // Check for breaches
    let analytics;
    try {
      analytics = await XposedOrNotService.getBreachAnalytics(email.email);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("timeout")) {
        res.status(504).json({
          success: false,
          error:
            "The breach checking service is taking too long to respond. Please try again in a few moments.",
        });
        return;
      }
      throw error;
    }

    const riskScore = XposedOrNotService.calculateRiskScore(analytics);

    // Extract breach details
    const breachDetails = analytics.ExposedBreaches?.breaches_details || [];
    const breachSummary = analytics.BreachesSummary;
    const breachMetrics = analytics.BreachMetrics;

    // Format yearly data
    const yearlyData = breachMetrics?.yearwise_details?.[0] || {};
    const yearHistory = Object.entries(yearlyData)
      .filter(([key]) => key.startsWith("y"))
      .map(([key, value]) => ({
        year: parseInt(key.replace("y", "")),
        count: value as number,
      }))
      .sort((a, b) => a.year - b.year);

    const breachData = {
      success: true,
      email: email.email,
      riskScore: riskScore,
      breachCount: breachDetails.length,
      breachSummary: breachSummary,
      breaches: breachDetails.map((breach: any) => {
        // Extract exposed data - handle both array and string formats
        let exposedDataArray: string[] | undefined;

        if (Array.isArray(breach.exposedData)) {
          exposedDataArray = breach.exposedData;
        } else if (typeof breach.exposedData === "string") {
          // If exposedData is a string (semicolon-separated), convert to array
          const exposedDataStr = breach.exposedData as string;
          exposedDataArray = exposedDataStr
            .split(";")
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
        }

        // If still no exposed data, try to get from xposed_data in metrics
        if (!exposedDataArray || exposedDataArray.length === 0) {
          if (
            breachMetrics?.xposed_data &&
            Array.isArray(breachMetrics.xposed_data)
          ) {
            // Extract from nested structure
            const extractDataTypes = (data: any): string[] => {
              const types: string[] = [];
              if (Array.isArray(data)) {
                data.forEach((item: any) => {
                  if (item?.children) {
                    item.children.forEach((child: any) => {
                      if (child?.children) {
                        child.children.forEach((leaf: any) => {
                          if (leaf?.name && leaf.name.startsWith("data_")) {
                            types.push(
                              leaf.name.replace("data_", "").replace(/_/g, " ")
                            );
                          }
                        });
                      }
                    });
                  }
                });
              }
              return types;
            };
            exposedDataArray = extractDataTypes(breachMetrics.xposed_data);
          }
        }

        // Construct logo URL - handle both relative and absolute paths
        let logoUrl = breach.logo;
        if (logoUrl && !logoUrl.startsWith("http")) {
          // If it's a relative path or filename, construct full URL
          if (logoUrl.startsWith("/")) {
            logoUrl = `https://xposedornot.com${logoUrl}`;
          } else {
            logoUrl = `https://xposedornot.com/static/logos/${logoUrl}`;
          }
        }

        // Extract date - handle multiple formats
        let breachDate = breach.breachedDate;
        if (!breachDate && breach.details) {
          // Try to extract date from description
          const dateMatch = breach.details.match(/\b(\d{4}-\d{2}-\d{2})\b/);
          if (dateMatch) {
            breachDate = dateMatch[1];
          }
        }

        // Handle alternative field names (with spaces) using type assertion
        const breachAny = breach as any;

        return {
          name:
            breach.breach ||
            breach.breachID ||
            breachAny["Breach ID"] ||
            "Unknown Breach",
          domain: breach.domain || breachAny.Domain || undefined,
          date: breachDate || breachAny["Breached Date"] || undefined,
          exposedData:
            exposedDataArray && exposedDataArray.length > 0
              ? exposedDataArray
              : undefined,
          exposedRecords:
            breach.exposedRecords || breachAny["Exposed Records"] || undefined,
          description:
            breach.exposureDescription ||
            breach.details ||
            breachAny["Exposure Description"] ||
            undefined,
          industry: breach.industry || breachAny.Industry || undefined,
          passwordRisk:
            breach.passwordRisk || breachAny["Password Risk"] || undefined,
          verified:
            breach.verified !== undefined
              ? breach.verified
              : breachAny.Verified === "Yes"
              ? true
              : breachAny.Verified === "No"
              ? false
              : undefined,
          logo: logoUrl || undefined,
          referenceURL:
            breach.referenceURL || breachAny["Reference URL"] || undefined,
          searchable:
            breach.searchable !== undefined
              ? breach.searchable
              : breachAny.Searchable === "Yes"
              ? true
              : breachAny.Searchable === "No"
              ? false
              : undefined,
          sensitive:
            breach.sensitive !== undefined
              ? breach.sensitive
              : breachAny.Sensitive === "Yes"
              ? true
              : breachAny.Sensitive === "No"
              ? false
              : undefined,
        };
      }),
      metrics: {
        risk: breachMetrics?.risk?.[0],
        passwordStrength: breachMetrics?.passwords_strength?.[0],
        industry: breachMetrics?.industry,
        exposedDataTypes: breachMetrics?.xposed_data,
      },
      yearHistory: yearHistory,
      pastes: analytics.PastesSummary,
    };

    // Check if this is a new breach detection (breaches increased)
    const previousBreachCount = email.breaches || 0;
    const newBreachCount = breachDetails.length;
    const isNewBreach = newBreachCount > previousBreachCount;

    // Update email document
    email.breachData = breachData;
    email.breaches = newBreachCount;
    email.status = newBreachCount > 0 ? "breached" : "safe";
    email.lastChecked = new Date();

    await email.save();

    // Create notification if new breaches were detected or if this is the first check with breaches
    if (isNewBreach && newBreachCount > 0 && breachData) {
      try {
        const breachNames = breachData.breaches
          ? (breachData.breaches as any[])
              .map((b: any) => b.name || "Unknown Breach")
              .slice(0, 5)
          : [];

        await createNotificationWithEmail(
          userId,
          "breach",
          "New breach detected",
          `Your email was found in ${newBreachCount} data breach${
            newBreachCount > 1 ? "es" : ""
          }`,
          {
            email: email.email,
            breachCount: newBreachCount,
            breachNames: breachNames,
          }
        );
      } catch (error) {
        console.error("Error creating breach notification:", error);
        // Don't fail the request if notification creation fails
      }
    }

    res.status(200).json({
      success: true,
      email: {
        id: email._id.toString(),
        email: email.email,
        status: email.status,
        breaches: email.breaches,
        addedDate: email.addedDate.toISOString(),
        breachData: email.breachData || null,
        lastChecked: email.lastChecked?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error checking email:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("timeout") ? 504 : 500;

    res.status(statusCode).json({
      success: false,
      error: errorMessage.includes("timeout")
        ? "The breach checking service is taking too long to respond. Please try again later."
        : "Failed to check email",
    });
  }
};
