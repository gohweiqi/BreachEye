/**
 * Auto Check Service
 * Automatically checks all emails in the database for new breaches
 */

import Email, { IEmail } from "../models/Email";
import { XposedOrNotService } from "./xposedOrNotService";
import { createNotificationWithEmail } from "../controllers/notificationController";

/**
 * Check a single email for breaches and update if new breaches are found
 */
async function checkEmailForBreaches(emailDoc: IEmail): Promise<void> {
  try {
    console.log(`Checking email: ${emailDoc.email} (User: ${emailDoc.userId})`);

    // Get current breach count before checking
    const previousBreachCount = emailDoc.breaches || 0;

    // Check for breaches using the breach service
    const analytics = await XposedOrNotService.getBreachAnalytics(emailDoc.email);
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
      email: emailDoc.email,
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

        // If still no exposed data, try to get from xposed_data in metrics
        if (!exposedDataArray || exposedDataArray.length === 0) {
          if (
            breachMetrics?.xposed_data &&
            Array.isArray(breachMetrics.xposed_data)
          ) {
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

        // Construct logo URL
        let logoUrl = breach.logo;
        if (logoUrl && !logoUrl.startsWith("http")) {
          if (logoUrl.startsWith("/")) {
            logoUrl = `https://xposedornot.com${logoUrl}`;
          } else {
            logoUrl = `https://xposedornot.com/static/logos/${logoUrl}`;
          }
        }

        // Extract date
        let breachDate = breach.breachedDate;
        if (!breachDate && breach.details) {
          const dateMatch = breach.details.match(/\b(\d{4}-\d{2}-\d{2})\b/);
          if (dateMatch) {
            breachDate = dateMatch[1];
          }
        }

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

    const newBreachCount = breachDetails.length;
    const isNewBreach = newBreachCount > previousBreachCount;

    // Update email document
    emailDoc.breachData = breachData;
    emailDoc.breaches = newBreachCount;
    emailDoc.status = newBreachCount > 0 ? "breached" : "safe";
    emailDoc.lastChecked = new Date();

    await emailDoc.save();

    // Create notification if new breaches were detected
    if (isNewBreach && newBreachCount > 0) {
      try {
        const breachNames = breachData.breaches
          ? (breachData.breaches as any[])
              .map((b: any) => b.name || "Unknown Breach")
              .slice(0, 5)
          : [];

        await createNotificationWithEmail(
          emailDoc.userId,
          "breach",
          "New breach detected",
          `Your email ${emailDoc.email} was found in ${newBreachCount} data breach${
            newBreachCount > 1 ? "es" : ""
          }`,
          {
            email: emailDoc.email,
            breachCount: newBreachCount,
            breachNames: breachNames,
          }
        );

        console.log(
          `✅ New breach detected for ${emailDoc.email}: ${newBreachCount} breaches (was ${previousBreachCount})`
        );
      } catch (error) {
        console.error(
          `Error creating notification for ${emailDoc.email}:`,
          error
        );
      }
    } else {
      console.log(
        `✓ Checked ${emailDoc.email}: ${newBreachCount} breaches (no change)`
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `Error checking email ${emailDoc.email}: ${errorMessage}`
    );
    // Update lastChecked even if check failed, so we know we tried
    emailDoc.lastChecked = new Date();
    await emailDoc.save().catch((saveError) => {
      console.error(`Failed to update lastChecked for ${emailDoc.email}:`, saveError);
    });
  }
}

/**
 * Check all emails in the database for breaches
 * Respects rate limiting (1 query per second for XposedOrNot API)
 */
export async function checkAllEmailsForBreaches(): Promise<void> {
  try {
    console.log("=".repeat(80));
    console.log("Starting auto-check for all emails in database...");
    console.log("=".repeat(80));

    // Get all emails from database
    const emails = await Email.find({}).exec();
    const totalEmails = emails.length;

    if (totalEmails === 0) {
      console.log("No emails found in database. Skipping auto-check.");
      return;
    }

    console.log(`Found ${totalEmails} email(s) to check`);

    let checkedCount = 0;
    let newBreachesFound = 0;
    let errorsCount = 0;

    // Process emails one at a time to respect rate limiting (1 query per second)
    for (const emailDoc of emails) {
      try {
        const previousBreachCount = emailDoc.breaches || 0;
        await checkEmailForBreaches(emailDoc);

        // Reload email to get updated breach count
        const updatedEmail = await Email.findById(emailDoc._id);
        if (updatedEmail) {
          const newBreachCount = updatedEmail.breaches || 0;
          if (newBreachCount > previousBreachCount) {
            newBreachesFound++;
          }
        }

        checkedCount++;

        // Rate limiting: wait 1 second between checks (XposedOrNot API limit)
        if (checkedCount < totalEmails) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        errorsCount++;
        console.error(
          `Error processing email ${emailDoc.email}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    console.log("=".repeat(80));
    console.log("Auto-check completed!");
    console.log(`Total emails checked: ${checkedCount}/${totalEmails}`);
    console.log(`New breaches detected: ${newBreachesFound}`);
    console.log(`Errors: ${errorsCount}`);
    console.log("=".repeat(80));
  } catch (error) {
    console.error("Error in checkAllEmailsForBreaches:", error);
    throw error;
  }
}

