import {
    Card,
    IndexTable,
    useIndexResourceState
} from '@shopify/polaris';

function GatewayActivityHistory({ orderRequest }) {

    function convertISOToYMD(isoDateString) {
        var date = new Date(Date.parse(isoDateString));

        var year = date.getUTCFullYear();
        var month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        var day = String(date.getUTCDate()).padStart(2, '0');

        var hours = String(date.getUTCHours()).padStart(2, '0');
        var minutes = String(date.getUTCMinutes()).padStart(2, '0');
        var seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const resourceName = {
        singular: 'Journal',
        plural: 'Journals',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(orderRequest ? orderRequest.journals : []);

    const rowMarkup = orderRequest && orderRequest.journals.map((journal, index) => (
        <IndexTable.Row id={journal.id} key={journal.id} position={index}>
            <IndexTable.Cell>{convertISOToYMD(journal.created_at)}</IndexTable.Cell>
            <IndexTable.Cell>{journal.data}</IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <div style={{ marginTop: "15px" }}>
            <Card>
                <IndexTable
                    resourceName={resourceName}
                    itemCount={(orderRequest ? orderRequest.journals : []).length}
                    selectedItemsCount={
                        allResourcesSelected ? 'All' : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                        { title: 'Date' },
                        { title: 'Message' },
                    ]}
                    selectable={false}
                >
                    {rowMarkup}
                </IndexTable>
            </Card>
        </div>
    );
}

GatewayActivityHistory.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default GatewayActivityHistory;
