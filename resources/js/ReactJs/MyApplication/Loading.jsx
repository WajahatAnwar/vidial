import { usePage } from "@inertiajs/react";
import { Frame, Loading as ShopLoading } from '@shopify/polaris';
import { useEffect, useState } from "react";
const Loading = () => {

    const [currentUser, setCurrentUser] = useState();
    const page = usePage().props;
    const query = page.ziggy.query;

    useEffect(() => {

        const getUser = async () => {

            const data = await fetch('/getSession');
            const response = await data.json();
            setCurrentUser(response.data);


            if (response.success && response.data.role_id == 1) {

                router.get(route('admin-dashboard', query));


            } else {

                fetch("/fetchCurrentUser", {
                    method: "post",
                    body: {}
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Something went wrong");
                        }
                        return response.json();
                    })
                    .then((data) => {
                        if (data.success) {
                            if (data.data.user.is_install) {
                                router.get(route('/', query));
                            } else {
                                router.get(route('/settings', query));
                            }

                        }
                        return;
                    })
                    .catch((error) => {
                        console.log(error);
                    });

            }
        }
        getUser();

    }, []);

    return (
        <div style={{ display: "block", marginTop: "-55px" }}>
            <Frame>
                <ShopLoading />
            </Frame>
        </div>
    )
}

export default Loading;
