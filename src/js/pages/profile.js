import ApiRequest from "../utils/ApiRequest.js";
import {Template} from "../config.js";
import Mustache from "./../utils/mustache.js"
import {getFormData} from "../utils/helpers.js";

export default async function () {

    const res = await ApiRequest.getProfile()

    if (!res) {
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
            avatarURL: uploadRes?.key || uploadRes?.key === null ? uploadRes.key : undefined
        })
    });
}
