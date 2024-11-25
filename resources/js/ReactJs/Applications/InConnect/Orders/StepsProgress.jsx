import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { router } from '@inertiajs/react';

const MultiStepForm = ({ order }) => {
    const [updates, setUpdates] = useState([]);
        
    useEffect(() => {
        if (order.updates) {
            setUpdates(order.updates);
        }
    }, [order]);

    const getStatus = (update) => {
        if (update.initiated_at && !update.completed_at && !update.failed_at) {
            return "Initiated";
        } else if (update.initiated_at && update.completed_at && !update.failed_a) {
            return "Success";
        } else if (update.initiated_at && update.failed_at) {
            return "Failed";
        }
        return "Pending";
    };

    const getStatusColor = (status) => {
        if (status === "Initiated") {
            return "cstm-initiated"; // Custom class for initiated
        }else if (status === "Success") {
            return "cstm-success"; // Custom class for success
        } else if (status === "Failed") {
            return "cstm-failed"; // Custom class for failed
        }
        return "cstm-pending"; // Default class for pending
    };

    const HtmlTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#f5f5f9',
            color: 'rgba(0, 0, 0, 0.87)',
            maxWidth: 320,
            fontSize: theme.typography.pxToRem(12),
            border: '1px solid #dadde9',
        },
    }));

    const handleViewLogs = () => {
        router.get(route('ic_logs.index', { trace: 'InconnectOrder', trace_id: order.id }));
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Stepper activeStep={updates.findIndex(update => !update.completed_at && !update.failed_at)} alternativeLabel>
                {updates.map((update, index) => (
                    <HtmlTooltip
                        key={index}
                        title={
                            <React.Fragment>
                                <Typography color="inherit" style={{ textTransform: "capitalize" }}>
                                    {getStatus(update)}
                                </Typography>
                                <em>{'Type '}</em> <b>{update.type ? update.type : ''}</b> <br />
                                <em>{'Initiated at '}</em> <b>{update.initiated_at ? update.initiated_at : ''}</b> <br />
                                <em>{'Completed at '}</em> <b>{update.completed_at ? update.completed_at : ''}</b> <br />
                                <em>{'Failed at '}</em> <b>{update.failed_at ? update.failed_at : ''}</b> <br />
                                {/* <em>{'Depends On '}</em> <b>{update.depends_on ? update.depends_on : ''}</b> <br /> */}
                                <em>{'Tries '}</em> <b>{update.tries ? update.tries : 0}</b> <br />
                                <u style={{ cursor: "pointer" }} onClick={handleViewLogs}>View Logs</u>
                            </React.Fragment>
                        }
                    >
                        <Step>
                            <StepLabel className={getStatusColor(getStatus(update))} StepIconProps={{
                                completed: false // Disables the tick icon
                            }}>
                                {update.name ? update.name : 'No status'}
                            </StepLabel>
                        </Step>
                    </HtmlTooltip>
                ))}
            </Stepper>
        </Box>
    );
};

export default MultiStepForm;