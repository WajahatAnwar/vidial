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
                            onClick={() => router.get(route('maven.goosely.orders'))}
                            className={isPageActive('maven/goosely/purchase-orders') ? 'cc-in-active' : ''}
                        >
                            <div style={{ background: `url('${window.appURL}/images/shopify-accounts.svg')`, width: '20px', height: '20px', backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>
                            <span>Purchase Orders</span>
                        </a>
                    </li>
                    <li style={{ marginBottom: "0px" }}>
                        <a
                            onClick={() => router.get(route('maven.goosely.logs'))}
                            className={isPageActive('maven/goosely/logs') ? 'cc-in-active' : ''}
                        >
                            <div style={{ background: `url('${window.appURL}/images/decorators-cc-in.svg')`, width: '20px', height: '20px', backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>
                            Logs
                        </a>
                    </li>
                </ul>
            </Card>
        </div>
    );
}
export default LeftMenu;
