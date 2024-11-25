
import { Button, Text } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import "@shopify/polaris/build/esm/styles.css";
import Swal from 'sweetalert2';


const OrderInvoiceNotes = ({ invoiceData, handleChangePreparePunchout }) => {
    const [value, setValue] = useState(invoiceData.note);

    const handleChange = (e) => {
        setValue(e.target.value);
    };
    const [loading, setLoading] = useState(false);
    const handleCreateNotes = async () => {
        setLoading(true);
        let formData = new FormData();
        formData.append('note', value);

        const response = await fetch(route('punchout.order-invoice.create-note.post', { id: invoiceData.id }), {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Note saved successfully.',
            });
            handleChangePreparePunchout()
        } else {
            if (response.status === 403) {

                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permissions.",
                });
            }
            else {

                setErrors(result.errors)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    };
    return (
        <div className='orderinvoicemain orderinvoicemain-notes p-3'>
            <Text variant="headingLg" as="h5">
                Note
            </Text>
            <div className='mt-3'>
                <textarea
                    className='gravitynotesTextArea'
                    rows={6}
                    value={value}
                    onChange={handleChange}
                    placeholder="Write a note........"
                    autoComplete="off"
                />
            </div>

            <div className='notesBtn'>
                <Button disabled={loading} primary size='large' onClick={handleCreateNotes}>Save Note</Button>
            </div>
        </div>
    )
}

export default OrderInvoiceNotes
