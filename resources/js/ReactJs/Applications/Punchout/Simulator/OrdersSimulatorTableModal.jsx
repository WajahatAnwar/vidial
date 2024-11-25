import { Text, ButtonGroup, Button } from "@shopify/polaris";

function OrdersSimulatorTableModal() {



  return (
    <div>

      <div className="ClientinformationWrapper">

        <div className="Clientinformationheadings">
          <div>
            <Text variant="headingLg" as="h6">
              Online store dashboard
            </Text>
          </div>
          <div className="Clientinformationbuttons">
            <ButtonGroup>
              <span className="multi-clor-btn"><Button variant="primary">Convert to Catalog</Button></span>
              <span className="pink-clor-btn"><Button>Edit</Button></span>
            </ButtonGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

OrdersSimulatorTableModal.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default OrdersSimulatorTableModal;
