
import '@/ReactJs/Applications/Filter/Assets/css/style.css';
import { Button, Card, Grid, Icon, Page } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';

import AppLayout from "@/ReactJs/Applications/Filter/AppLayout";
import { setAddOptionModal, setImagesTableDataForUpdateLogos, setUpdateOptionId } from '@/ReactJs/reducers/ClubColorSlice';
import { router, usePage } from '@inertiajs/react';
import { useDispatch } from 'react-redux';
import AddEditFilter from './AddEditFilter';
import FiltersSetSelect from './FiltersSetSelect';
import FiltersTable from "./FiltersTable";

const FilterSets = () => {

    const page = usePage().props;
    const { query } = page.ziggy;

    const dispatch = useDispatch();

    return (
        <div style={{ background: `url('${window.appURL}/images/background10.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <AddEditFilter />
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('index_filters', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Filters</div>
                            </div>
                            <Button onClick={() => { dispatch(setImagesTableDataForUpdateLogos([])); dispatch(setUpdateOptionId(false)); dispatch(setAddOptionModal(true)); }}> Add Filter +</Button>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
                        <FiltersTable defaultEntries="10" indexPath={route("filters.get")} />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Filter Sets</p>
                            <FiltersSetSelect />
                        </Card>
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}
FilterSets.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default FilterSets;
