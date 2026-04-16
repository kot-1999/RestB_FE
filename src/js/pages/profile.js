import ApiRequest from "../utils/ApiRequest.js";
import Template from "../utils/Template.js";
import Mustache from "./../utils/mustache.js"
import {getFormData, showError} from "../utils/helpers.js";

export default async function () {
    const res = await ApiRequest.getProfile()

    if (!res) {
        showError(new Error("No profile found"));
        return
    }

    // Render profile data using Mustache
    $('#dummyProfile').replaceWith(Mustache.render(Template.component.dummyProfileTemplate(), res))

    // Handle Form Submission
    $('#updateProfileForm').submit(async function (e) {
        e.preventDefault();

        // Parse form
        const data = getFormData(e.target)

        // Upload
        let uploadRes = undefined
        if (data?.avatar?.name)
            uploadRes = await ApiRequest.uploadFile(data.avatar)

        if (uploadRes?.publicUrl) {
            $('#userAvatar').attr('src', uploadRes.publicUrl)
        }
        ApiRequest.updateProfile({
            ...data,
            // If avatarURL was not updated, then must be set to undefined
            avatarURL: uploadRes?.publicUrl || uploadRes?.publicUrl === null ? uploadRes.publicUrl : undefined
        })
    });

    // Handle Delete Profile Button with Security Confirmation
    $(document).on('click', '.btn-delete-profile', function(e) {
        e.preventDefault();

        const confirmed = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");

        if (confirmed) {
            console.log("[DEBUG] Delete Profile button clicked - Action confirmed by user.");
            alert("Delete Profile action confirmed. (Check console for debug log)");
        } else {
            console.log("[DEBUG] Delete Profile action cancelled by user.");
        }
    });
}