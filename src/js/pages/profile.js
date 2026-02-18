import ApiRequest from "../utils/ApiRequest.js";
import {Template} from "../config.js";
import Mustache from "./../utils/mustache.js"

export default async function () {
    const res = await ApiRequest.getProfile()
    if (!res) {
        return
    }
    console.log('loading from profile.js', res)
    $('#dataCard').append(Mustache.render(Template.component.dummyProfileTemplate(), res))

}
