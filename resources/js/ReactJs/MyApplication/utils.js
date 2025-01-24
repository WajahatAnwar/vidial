import { usePage } from "@inertiajs/react";
import { useState } from "react";

export const downloadVideo = (video_path) => {
    if (video_path) {
        var formData = new FormData();
        formData.append("video_path", video_path);
        fetch(route('downloadVideo'), {
            method: "post",
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    window.open(data.data.link);

                } else {
                    alert(
                        data.message
                    );
                }
                return;
            })
            .catch((error) => {
                console.log(error);
            });
    } else {
        alert('something went wrong');
    }

};
/******** Operation on Videos  ******/
export const videoOperation = (id, type) => {
    const status = type ? "Approved" : "Reject";
    const confirmed = confirm(`Are you sure you want to mark this ${status}?`);
    var formData = new FormData();
    formData.append("video_id", id);
    formData.append("type", type);
    if (confirmed) {
        fetch(route('videoOperation'), {
            method: "post",
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    alert(
                        "Congratulation video has been approved code :" +
                        data.data.code
                    );

                } else {
                    alert(
                        data.message
                    );
                }
                return;
            })
            .catch((error) => {
                console.log(error);
            });
    }
};

/****** store name  *******/

export const showStoreName = () => {
    return localStorage.getItem('store')
}
