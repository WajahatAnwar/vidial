import { TextField, IndexTable, Card, Thumbnail } from '@shopify/polaris';
import { useEffect, useState } from 'react';
import Toggle from '@/ReactJs/Components/Toggle';
import { setImagesTableRows, setImagesTableStaticRows, setSelectedLogoGroupId } from '@/ReactJs/reducers/ClubColorSlice';
import { useDispatch, useSelector } from 'react-redux';


function ImagesTable() {

    const optionsReload = useSelector((state) => state.clubColor.optionsReload);
    const selectedLogoGroupId = useSelector((state) => state.clubColor.selectedLogoGroupId);
    const updateOptionId = useSelector((state) => state.clubColor.updateOptionId);
    const imagesTableRows = useSelector((state) => state.clubColor.imagesTableRows);
    const imagesTableStaticRows = useSelector((state) => state.clubColor.imagesTableStaticRows);
    const imagesTableDataForUpdateLogos = useSelector((state) => state.clubColor.imagesTableDataForUpdateLogos);
    const dispatch = useDispatch();

    useEffect(() => {

        fetch(`/virtual_options/get_logo_group_logos?logo_group_id=${selectedLogoGroupId.value}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                const myRows = [];
                data.data.forEach((element, index) => {

                    myRows.push(
                        {
                            id: element.id,
                            code_name: element.code_name,
                            logo_image_link: element.logo_image_link,
                            pre_select: index == 0 ? imagesTableDataForUpdateLogos.length > 0 ? false : true : false,
                            up_charge: 0,
                        });
                });

                if (imagesTableDataForUpdateLogos.length > 0) {
                    let temp = myRows;
                    temp.forEach((element, index) => {
                        let row = imagesTableDataForUpdateLogos.find(value => value.logo_id == temp[index].id);
                        if (row) {
                            temp[index] = { ...temp[index], up_charge: row.upcharge_amount };
                            temp[index] = { ...temp[index], pre_select: row.pre_select_status };
                        }
                    });
                }

                dispatch(setImagesTableRows(myRows));
                dispatch(setImagesTableStaticRows(myRows));
            });

    }, [imagesTableDataForUpdateLogos, updateOptionId, selectedLogoGroupId, optionsReload]);

    const resourceName = {
        singular: 'logo',
        plural: 'logos',
    };

    const [queryValue, setQueryValue] = useState("");

    const rowMarkup = imagesTableRows.map(
        ({ id, code_name, logo_image_link, pre_select, up_charge }, index) => (

            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    <Toggle onClick={(e) => {

                        let temp = [...imagesTableRows];

                        temp.forEach((element, indexInside) => {

                            if (indexInside == index) {
                                temp[indexInside] = { ...temp[indexInside], pre_select: e.target.checked };
                            } else {
                                temp[indexInside] = { ...temp[indexInside], pre_select: false };
                            }
                        });

                        dispatch(setImagesTableRows(temp));

                    }} toggled={pre_select} />
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Thumbnail
                        source={`${window.appURL}/${logo_image_link}`}
                        alt="logo_image"
                    />
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {code_name}
                </IndexTable.Cell>
                <IndexTable.Cell className='style_yes'>
                    <div style={{ display: "flex", justifyContent: "flex-end", width: "70px" }}>
                        <TextField type="number" value={up_charge} onChange={(e) => {

                            let temp = [...imagesTableRows];
                            temp[index] = { ...temp[index], up_charge: e };

                            dispatch(setImagesTableRows(temp));
                        }} />
                    </div>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const handleFiltersQueryChange = (value) => {

        setQueryValue(value);
        let temp = [...imagesTableStaticRows];
        temp.forEach((element, index) => {
            let row = imagesTableRows.find(value => value.id == temp[index].id);
            if (row) {
                temp[index] = { ...temp[index], up_charge: row.up_charge };
                temp[index] = { ...temp[index], pre_select: row.pre_select }
            }
        });

        let pre_select_check = true;
        temp.forEach((element, index) => {
            if (temp[index].pre_select == true && pre_select_check == true) {
                temp[index] = { ...temp[index], pre_select: true };
                pre_select_check = false;
            } else {
                temp[index] = { ...temp[index], pre_select: false };
            }
        });

        dispatch(setImagesTableStaticRows(temp));
        dispatch(setImagesTableRows(temp.filter(insideValue => insideValue.code_name.toLowerCase().includes(value.toLowerCase()))));
    };

    return (
        <Card>
            <div style={{ padding: '10px', display: 'flex', marginTop: "4px" }}>
                <div style={{ flex: 1 }}>
                    <TextField type='text' value={queryValue} onChange={handleFiltersQueryChange} placeholder='Filter Items' />
                </div>
            </div>
            <IndexTable
                selectable={false}
                resourceName={resourceName}
                itemCount={imagesTableRows.length}
                hasMoreItems
                headings={[
                    { title: 'Pre Select' },
                    { title: 'Logo' },
                    { title: 'Name' },
                    { title: 'Upcharge' },
                ]}
            >
                {rowMarkup}
            </IndexTable>
        </Card>
    );
}

export default ImagesTable;
