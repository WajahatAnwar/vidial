import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    //TOAST
    toastMessage: "",
    toastActive: false,
    //COLORS
    colorsReload: false,
    updateFamilyId: false,
    //LOGO
    logosReload: false,
    updateLogoId: false,
    addLogoModal: false,
    logoTableSelectedResources: [],
    logoTableAllResourcesSelected: false,
    logoTableAssignColorFamilyModal: false,
    logoTableAssignLogoGroupModal: false,
    updateLogoGroupId: false,
    logoTableSearchQuery: "",
    //OPTION SET
    optionsReload: false,
    updateOptionId: false,
    addOptionModal: false,
    optionTableSelectedResources: [],
    optionTableAllResourcesSelected: false,
    optionTableAssignOptionSetModal: false,
    updateOptionSetId: false,
    selectedLogoGroupId: false,
    imagesTableStaticRows: [],
    imagesTableRows: [],
    imagesTableDataForUpdateLogos: [],
    //APPLICATOR
    applicatorReload: false,
    optionTableSearchQuery: "",
}

export const ClubColorSlice = createSlice({
    name: 'ClubColorTwo',
    initialState,
    reducers: {
        setToastMessage: (state, action) => {
            state.toastMessage = action.payload;
        },
        setToastActive: (state, action) => {
            state.toastActive = action.payload;
        },
        //
        setColorsReload: (state, action) => {
            state.colorsReload = action.payload;
        },
        setUpdateFamilyId: (state, action) => {
            state.updateFamilyId = action.payload;
        },
        //
        setLogosReload: (state, action) => {
            state.logosReload = action.payload;
        },
        setUpdateLogoId: (state, action) => {
            state.updateLogoId = action.payload;
        },
        setAddLogoModal: (state, action) => {
            state.addLogoModal = action.payload;
        },
        setLogoTableSelectedResources: (state, action) => {
            state.logoTableSelectedResources = action.payload;
        },
        setLogoTableAllResourcesSelected: (state, action) => {
            state.logoTableAllResourcesSelected = action.payload;
        },
        setLogoTableAssignColorFamilyModal: (state, action) => {
            state.logoTableAssignColorFamilyModal = action.payload;
        },
        setLogoTableAssignLogoGroupModal: (state, action) => {
            state.logoTableAssignLogoGroupModal = action.payload;
        },
        setUpdateLogoGroupId: (state, action) => {
            state.updateLogoGroupId = action.payload;
        },
        //
        setOptionsReload: (state, action) => {
            state.optionsReload = action.payload;
        },
        setUpdateOptionId: (state, action) => {
            state.updateOptionId = action.payload;
        },
        setAddOptionModal: (state, action) => {
            state.addOptionModal = action.payload;
        },
        setOptionTableSelectedResources: (state, action) => {
            state.optionTableSelectedResources = action.payload;
        },
        setOptionTableAllResourcesSelected: (state, action) => {
            state.optionTableAllResourcesSelected = action.payload;
        },
        setOptionTableAssignOptionSetModal: (state, action) => {
            state.optionTableAssignOptionSetModal = action.payload;
        },
        setUpdateOptionSetId: (state, action) => {
            state.updateOptionSetId = action.payload;
        },
        setSelectedLogoGroupId: (state, action) => {
            state.selectedLogoGroupId = action.payload;
        },
        setImagesTableStaticRows: (state, action) => {
            state.imagesTableStaticRows = action.payload;
        },
        setImagesTableRows: (state, action) => {
            state.imagesTableRows = action.payload;
        },
        setImagesTableDataForUpdateLogos: (state, action) => {
            state.imagesTableDataForUpdateLogos = action.payload;
        },
        //
        setApplicatorReload: (state, action) => {
            state.applicatorReload = action.payload;
        },
        setLogoTableSearchQuery: (state, action) => {
            state.logoTableSearchQuery = action.payload;
        },
        setOptionTableSearchQuery: (state, action) => {
            state.optionTableSearchQuery = action.payload;
        },
    },
})

export const {
    setOptionTableSearchQuery,
    setLogoTableSearchQuery,
    setApplicatorReload,
    setImagesTableDataForUpdateLogos,
    setImagesTableStaticRows,
    setImagesTableRows,
    setSelectedLogoGroupId,
    setUpdateOptionSetId,
    setOptionTableAllResourcesSelected,
    setOptionTableAssignOptionSetModal,
    setOptionTableSelectedResources,
    setAddOptionModal,
    setUpdateOptionId,
    setOptionsReload,
    setColorsReload,
    setUpdateFamilyId,
    setLogosReload,
    setUpdateLogoId,
    setAddLogoModal,
    setLogoTableSelectedResources,
    setLogoTableAllResourcesSelected,
    setLogoTableAssignColorFamilyModal,
    setLogoTableAssignLogoGroupModal,
    setUpdateLogoGroupId,
    setToastActive,
    setToastMessage,
} = ClubColorSlice.actions

export default ClubColorSlice.reducer
