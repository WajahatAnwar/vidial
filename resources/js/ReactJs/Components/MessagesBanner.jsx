import { Banner, Page } from "@shopify/polaris";
import { useEffect } from "react";

const MessagesBanner = ({ flag, message, handleClose, m, mB, mT }) => {


    const margin = m ? m : "0px";
    const marginBottom = mB ? mB : "0px";
    const marginTop = mT ? mT : "0px";

    return (
        <div>
            {
                flag ? <div style={{ margin: margin, marginBottom: marginBottom, marginTop: marginTop }}>
                    <Banner
                        title={flag == "success" ? 'Success' : 'Error'}
                        status={flag == "success" ? 'success' : 'critical'}
                        onDismiss={handleClose}
                    >
                        <p> {message} </p>
                    </Banner>
                </div> : null
            }
        </div>
    );
}

export default MessagesBanner;
