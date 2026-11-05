import AppLayout from '../MyApplication/AppLayout';
import {
    openShopifyChargeConfirmation,
    readChargeReturnState,
    requestShopifyManualPlanCharge,
    presentPlanCards,
} from './shopifyManualPlanCharge';

import {
    Badge,
    Banner,
    Button,
    Card,
    Grid,
    Page,
    Spinner,
    Text,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";

const NOTICE_COPY = {
    pending_contract: "Shopify Manual Plan confirmation is not available yet. The charge was not opened.",
    declined: "The Shopify charge was declined. Your current plan and quotas are unchanged.",
    freemium: "This shop is on the free plan. Quotas below are from the current plan.",
    accepted: "Plan confirmed. Quotas below are refreshed from the current plan.",
    error: "The plan could not be confirmed.",
};

const NOTICE_TONE = {
    pending_contract: "warning",
    declined: "warning",
    freemium: "info",
    accepted: "success",
    error: "critical",
};

function noticeText(notice) {
    if (!notice) {
        return "";
    }
    return notice.message || NOTICE_COPY[notice.kind] || NOTICE_COPY.error;
}

function quotaLabel(remaining, allowance, noun) {
    if (remaining == null && allowance == null) {
        return null;
    }
    if (remaining == null) {
        return `${allowance} ${noun}`;
    }
    if (allowance == null) {
        return `${remaining} ${noun} remaining`;
    }
    return `${remaining} of ${allowance} ${noun} remaining`;
}

function descriptionLines(plan) {
    return Object.keys(plan)
        .filter((key) => key.startsWith("description_"))
        .map((key) => plan[key])
        .filter((line) => line != null && String(line).trim() !== "");
}

function Plans() {
    const [plans, setPlans] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);
    const [notice, setNotice] = useState(null);

    const loadPlans = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }
        try {
            const response = await fetch(route("get-plans"));
            if (!response.ok) {
                throw new Error("Plans could not be loaded.");
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || "Plans could not be loaded.");
            }
            setPlans(presentPlanCards(data.data));
            setShop(data.users && typeof data.users === "object" && !Array.isArray(data.users) ? data.users : null);
        } catch (error) {
            if (!silent) {
                setPlans([]);
                setShop(null);
            }
            setNotice({
                kind: "error",
                message: error.message || "Plans could not be loaded.",
            });
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const returned = readChargeReturnState(window.location.search);
        if (returned) {
            setNotice(returned);
        }
        loadPlans();
    }, [loadPlans]);

    const handleSelectPlan = async (plan) => {
        setSubmittingId(plan.id);
        setNotice(null);
        try {
            const result = await requestShopifyManualPlanCharge(plan.id);
            if (result.kind === "redirect") {
                openShopifyChargeConfirmation(result.confirmationUrl);
                return;
            }
            setNotice(result);
            if (result.kind === "freemium" || result.kind === "accepted") {
                await loadPlans({ silent: true });
            }
        } catch (error) {
            setNotice({
                kind: "error",
                message: error.message || NOTICE_COPY.error,
            });
        } finally {
            setSubmittingId(null);
        }
    };

    const currentPlan = plans.find((plan) => shop && plan.id == shop.plan_id);
    const videoQuota = shop ? quotaLabel(shop.remaining_videos, shop.ugc_video_count, "videos") : null;
    const emailQuota = shop ? quotaLabel(shop.remaining_email, shop.ugc_email_count, "emails") : null;

    return (
        <Page>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <Text variant="headingXl" as="h4">
                    Choose the perfect plan
                </Text>
            </div>

            {notice ? (
                <div style={{ marginBottom: "16px" }}>
                    <Banner
                        tone={NOTICE_TONE[notice.kind] || "critical"}
                        title={notice.kind === "accepted" ? "Plan updated" : "Plan billing"}
                        onDismiss={() => setNotice(null)}
                    >
                        <p>{noticeText(notice)}</p>
                    </Banner>
                </div>
            ) : null}

            {shop && (currentPlan || videoQuota || emailQuota) ? (
                <div style={{ marginBottom: "16px" }}>
                    <Banner tone="info" title={currentPlan ? `Current plan: ${currentPlan.name}` : "Current quotas"}>
                        <p>
                            {[videoQuota, emailQuota].filter(Boolean).join(" · ") || "Quotas will appear after the plan is confirmed."}
                        </p>
                    </Banner>
                </div>
            ) : null}

            <Card>
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                        <Spinner accessibilityLabel="Loading plans" size="large" />
                    </div>
                ) : plans.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <Text as="p">No plans are available.</Text>
                    </div>
                ) : (
                    <Grid>
                        {plans.map((data) => {
                            const selected = shop && data.id == shop.plan_id;
                            const lines = descriptionLines(data);
                            const planVideos = data.ugc_video_count != null ? `${data.ugc_video_count} videos / month` : null;
                            const planEmails = data.ugc_email_count != null ? `${data.ugc_email_count} emails / month` : null;
                            const recommended = String(data.name || "").trim().toLowerCase() === "premium";

                            return (
                                <Grid.Cell
                                    key={data.id}
                                    columnSpan={{ xs: 6, sm: 6, md: 6, lg: 3, xl: 3 }}
                                >
                                    <div
                                        style={{
                                            border: "1px solid #C9CCCF",
                                            padding: "10px",
                                            borderRadius: "10px",
                                            height: "520px",
                                            minHeight: "520px",
                                        }}
                                    >
                                        <div style={{ textAlign: "end", marginTop: "-20px" }}>
                                            {recommended ? (
                                                <Badge tone="attention">Recommended</Badge>
                                            ) : (
                                                <div className="customHidden">
                                                    <Badge>Recommended</Badge>
                                                </div>
                                            )}
                                        </div>
                                        <Text variant="headingLg" as="h5">
                                            {data.name}
                                        </Text>
                                        <p
                                            style={{
                                                marginBottom: "30px",
                                                marginTop: "10px",
                                                height: "100px",
                                            }}
                                        >
                                            {data.description}
                                        </p>
                                        <Text variant="headingXl" as="h4">
                                            ${Math.floor(data.price)}
                                        </Text>
                                        <Text variant="bodySm" as="p">
                                            per month
                                        </Text>
                                        <div style={{ marginTop: "20px", marginBottom: "33px" }}>
                                            {selected ? (
                                                <Button disabled fullWidth>
                                                    Selected Plan
                                                </Button>
                                            ) : (
                                                <span className="polaris-black-btn-global">
                                                    <Button
                                                        fullWidth
                                                        loading={submittingId === data.id}
                                                        disabled={submittingId !== null}
                                                        onClick={() => handleSelectPlan(data)}
                                                    >
                                                        Select plan
                                                    </Button>
                                                </span>
                                            )}
                                        </div>
                                        {[planVideos, planEmails, ...lines].filter(Boolean).map((line, index) => (
                                            <p
                                                key={`${data.id}-${index}`}
                                                style={{
                                                    marginBottom: "8px",
                                                    textAlign: "center",
                                                    fontSize: "14px",
                                                    padding: "0px 5px",
                                                }}
                                            >
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </Grid.Cell>
                            );
                        })}
                    </Grid>
                )}
            </Card>
        </Page>
    );
}

Plans.layout = page => <AppLayout children={page} />
export default Plans;
