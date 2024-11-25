import { Card } from '@shopify/polaris';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { router, usePage } from '@inertiajs/react';
function LeftMenu() {
    const page = usePage().props;
    const { query } = page.ziggy;
    const isPageActive = (targetPage) => {
        return window.location.pathname.includes(targetPage);
    };
    return (
        <div>
            <Card>
                <ul className='leftmenu-ic-shopifyaccounts'>
                    <li style={{ marginTop: "0px" }}>
                        <a
                            onClick={() => router.get(route('ic_shopifyaccounts'))}
                            className={isPageActive('shopify-accounts') ? 'cc-in-active' : ''}
                        >
                            <div style={{ background: `url('${window.appURL}/images/shopify-accounts.svg')`, width: '20px', height: '20px', backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>
                            <span>Shopify Accounts</span>
                        </a>
                    </li>
                    <li>
                        <a
                            onClick={() => router.get(route('ic_vendors.index'))}
                            className={isPageActive('vendors') ? 'cc-in-active' : ''}
                        >
                            <div style={{ background: `url('${window.appURL}/images/vendors-cc-in.svg')`, width: '20px', height: '20px', backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>
                            Vendors
                        </a>
                    </li>
                    <li style={{ marginBottom: "0px" }}>
                        <a
                            onClick={() => router.get(route('ic_decorators.index'))}
                            className={isPageActive('decorators') ? 'cc-in-active' : ''}
                        >
                            <div style={{ background: `url('${window.appURL}/images/decorators-cc-in.svg')`, width: '20px', height: '20px', backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>
                            Decorators
                        </a>
                    </li>
                    <li style={{ marginBottom: "0px" }}>
                        <a
                            onClick={() => router.get(route('ic_goosely_rules'))}
                            className={isPageActive('goosely-rules') ? 'cc-in-active' : ''}
                        >
                            <div style={{ background: `url('${window.appURL}/images/general-settings-cc-in.svg')`, width: '20px', height: '20px', backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>
                            Rules
                        </a>
                    </li>
                    <li style={{ marginBottom: "0px" }}>
                        <a
                            onClick={() => router.get(route('ic_goosely_jobs'))}
                            className={isPageActive('goosely-jobs') ? 'cc-in-active' : ''}
                        >
                            <div style={{ background: `url('${window.appURL}/images/general-settings-cc-in.svg')`, width: '20px', height: '20px', backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>
                            Jobs
                        </a>
                    </li>
                </ul>
            </Card>
        </div>
    );
}
export default LeftMenu;
