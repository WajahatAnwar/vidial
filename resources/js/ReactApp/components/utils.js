import { useState } from "react";

export const downloadVideo = (video_link) => {
    window.open(video_link);
};
/******** Operation on Videos  ******/
export const videoOperation = (id, type) => {
    const status = type ? "Approved" : "Reject";
    const confirmed = confirm(`Are you sure you want to ${status}?`);
    var formData = new FormData();
    formData.append("video_id", id);
    formData.append("type", type);
    if (confirmed) {
        fetch("/videoOperation", {
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

                    return true;
                } else {
                    console.log(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
};
