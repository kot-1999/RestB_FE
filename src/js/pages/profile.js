import ApiRequest from "../utils/ApiRequest.js";
import {Template} from "../config.js";
import Mustache from "./../utils/mustache.js"
import {getFormData, showError} from "../utils/helpers.js";

export default async function () {

    const res = await ApiRequest.getProfile()

    if (!res) {
        showError(new Error("No profile found"));
        return
    }

    $('#dummyProfile').replaceWith(Mustache.render(Template.component.dummyProfileTemplate(), res))


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
}
