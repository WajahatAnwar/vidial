import { Banner, Icon } from '@shopify/polaris';
import { PlayMinor } from '@shopify/polaris-icons';
import React from 'react'
import linksvgrepo from "./imges/link-svgrepo.svg";

export default function Ticker() {
  return (
      <div className="setting_banner">
          <Banner
              title={`Welcome to GoodAuthentic 👋`}

              status="info"
              onDismiss={() => { }}
          >
              <p>GoodAuthentic will help you collect videos from and reward your customers.</p>
              <a style={{ textDecoration: "none" }} href="#">
                  <button onClick={() => {
                      window.open(
                          'https://goodauthentic.notion.site/Merchant-Guide-d8e3158efbd64a69a876b89d37d78b62'
                      );
                  }} style={{
                      cursor: 'pointer',
                      display: "flex", padding: "7px 10px",
                      marginTop: "20px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid #95c9b4", borderRadius: "4px"
                  }}>
                      {/* <Icon
                          source={PlayMinor}
                          color="base"
                      /> */}
                      <img src={linksvgrepo} style={{width:"20px",height:"20px"}}/>
                      <span style={{ marginLeft: "10px" }}>How GoodAuthentic Works</span></button></a>
          </Banner>
      </div>
  )
}
