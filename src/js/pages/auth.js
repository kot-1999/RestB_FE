import { Template } from "../config.js";
import ApiRequest from "../utils/ApiRequest.js";
import { LocalStorage, showError } from "../utils/helpers.js";

/**
 * AUTH PAGE CONTROLLER
 * Option 3: keep existing login/register fields in #auth01,
 * and when "Forgot Password" is clicked, append forgot-password UI
 * underneath inside #forgotWrap (instead of replacing #auth01).
 */

/* ---------- Helpers ---------- */

function getAuthData() {
  return LocalStorage.get("auth");
}

function getLoggedInEmail(authData) {
  if (!authData) return null;
  // Your ApiRequest stores res.user ?? res.admin into LocalStorage
  // Those usually include email, but guard just in case.
  return authData.email || authData?.user?.email || authData?.admin?.email || null;
}

function clearForgotWrap() {
  $("#forgotWrap").remove();
  $("#auth01").show();
}

function ensureForgotWrap() {
  if (!$("#forgotWrap").length) {
    $("#auth01").append('<div id="forgotWrap"></div>');
  }
}

function showForgotPasswordSection() {
  // Hide the normal fields (inside #auth01)
  $("#auth01").hide();

  // Ensure wrap exists directly BELOW the Forgot Password button
  const $forgotBtn = $('.auth-btn[data-auth="forgotPassword"]');

  if (!$("#forgotWrap").length) {
    $forgotBtn.after('<div id="forgotWrap"></div>');
  }

  $("#forgotWrap").show().empty().append(Template.component.forgotPassword());
}

/**
 * Read email for forgot password safely.
 * This avoids conflicts if you end up with multiple #email inputs.
 */
function readForgotEmail() {
  // Prefer email input inside forgotWrap if it exists
  const fromWrapById = $("#forgotWrap #email").val();
  if (fromWrapById) return fromWrapById;

  const fromWrapEmailType = $("#forgotWrap input[type='email']").first().val();
  if (fromWrapEmailType) return fromWrapEmailType;

  // Fallback to main email field (login/register)
  return $("#email").val();
}

/* ---------- Button Group Setup ---------- */

// Generic function to toggle active button in a group and update hidden input and form
function setupButtonGroup(buttonSelector, hiddenInputSelector, dataAttr) {
  // Avoid stacking duplicate handlers when navigating back to auth page
  $(document).off("click.auth", buttonSelector);

  $(document).on("click.auth", buttonSelector, function () {
    // Remove active from all buttons in this group
    $(buttonSelector).removeClass("active");
    // Add active to clicked button
    $(this).addClass("active");

    // Update hidden input with the clicked button's data attribute
    const value = $(this).data(dataAttr);
    $(hiddenInputSelector).val(value);

    // For user-type buttons, we do not swap templates
    if (dataAttr === "type") return;

    // For auth-type buttons, swap or append UI
    if (value === "login") {
      clearForgotWrap();
      $("#auth01").empty().append(Template.component.login());
    } else if (value === "register") {
      clearForgotWrap();
      $("#auth01").empty().append(Template.component.register());
    } else if (value === "forgotPassword") {
      // Option 3: KEEP whatever is in #auth01 and append forgot section below it
      showForgotPasswordSection();
    }
  });
}

/* ---------- Page Load ---------- */

const load = () => {
  // Auth template must exist before binding
  const $form = $("#authForm");
  if (!$form.length) return;

  // ✅ Only block auth UI if a REAL session exists (token present)
  const authData = getAuthData();
  if (authData?.token) {
    const email = getLoggedInEmail(authData);
    showError(`Log Out First.\nLogged in as: ${email ?? "user"}`);
    return;
  }

  // --------- helpers scoped to this load() ---------

  const getSubmitBtn = () =>
    $form.find('button[type="submit"], input[type="submit"]').first();

  const clearErrorUI = () => {
    $form.removeClass("is-error");
    $form.find("input").removeClass("is-invalid");
  };

  const setLoading = (on) => {
    const $btn = getSubmitBtn();
    $btn.toggleClass("is-loading", !!on);
  };

  const setSuccess = () => {
    const $btn = getSubmitBtn();
    $btn.addClass("is-success");
    setTimeout(() => $btn.removeClass("is-success"), 650);
  };

  const enterForgotMode = () => {
    // Hide the normal login/register fields
    $("#auth01").hide();

    // Ensure forgot UI is directly BELOW the forgot button
    const $forgotBtn = $('.auth-btn[data-auth="forgotPassword"]');
    if (!$("#forgotWrap").length) {
      $forgotBtn.after('<div id="forgotWrap"></div>');
    }
    $("#forgotWrap").show().empty().append(Template.component.forgotPassword());
  };

  const exitForgotMode = () => {
    $("#forgotWrap").remove();
    $("#auth01").show();
  };

  // Disable submit until required fields are filled (simple UX)
  const toggleSubmit = () => {
    const authType = $("#authType").val();
    const $btn = getSubmitBtn();

    const email =
      authType === "forgotPassword"
        ? readForgotEmail()
        : $("#email").val();

    const password = $("#password").val();

    const ok =
      authType === "forgotPassword"
        ? !!email
        : authType === "login"
          ? !!email && !!password
          : true; // register has more fields; keep permissive to avoid breaking

    $btn.prop("disabled", !ok);
    $btn.css("opacity", ok ? 1 : 0.6);
  };

  // --------- initial render ---------

  $("#auth01").empty().append(Template.component.login());
  exitForgotMode();
  toggleSubmit();

  // --------- event binding (avoid duplicates in SPA) ---------

  // Clear invalid styling as soon as user types
  $(document).off("input.auth", "#authForm input");
  $(document).on("input.auth", "#authForm input", function () {
    $(this).removeClass("is-invalid");
    $form.removeClass("is-error");
    toggleSubmit();
  });

  // Keep forgot wrap removed when switching login/register
  $(document).off("click.authMode", ".auth-btn");
  $(document).on("click.authMode", ".auth-btn", function () {
    const value = $(this).data("auth");

    if (value === "login") {
      exitForgotMode();
      $("#auth01").empty().append(Template.component.login());
    } else if (value === "register") {
      exitForgotMode();
      $("#auth01").empty().append(Template.component.register());
    } else if (value === "forgotPassword") {
      enterForgotMode();
    }

    // Let your existing setupButtonGroup still do active toggling + hidden input updates.
    // We only handle view toggling here.
    setTimeout(toggleSubmit, 0);
  });

  // Setup both button groups (active state + hidden input updates)
  setupButtonGroup(".user-type-btn", "#userType", "type");
  setupButtonGroup(".auth-btn", "#authType", "auth");

  // Prevent duplicate submit handlers if user revisits page
  $form.off("submit.auth");

  // --------- submit ---------
  $form.on("submit.auth", async function (e) {
    e.preventDefault();

    const $submitBtn = getSubmitBtn();

    clearErrorUI();
    $submitBtn.removeClass("is-success");
    setLoading(true);

    const userType = $("#userType").val();
    const authType = $("#authType").val();

    try {
      let res = null;

      if (authType === "register") {
        res = await ApiRequest.register(
          {
            email: $("#email").val(),
            password: $("#password").val(),
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            phone: $("#phone").val(),
          },
          userType
        );
      } else if (authType === "login") {
        res = await ApiRequest.login(
          {
            email: $("#email").val(),
            password: $("#password").val(),
          },
          userType
        );
      } else if (authType === "forgotPassword") {
        const email = readForgotEmail();
        res = await ApiRequest.forgotPassword({ email }, userType);
      } else {
        throw new Error("Unknown auth type");
      }

      if (!res) throw new Error("Request failed");

      setLoading(false);
      setSuccess();

      // redirect after successful auth
if (authType === "login" || authType === "register") {
    const authData = LocalStorage.get("auth");

    if (authData?.role) {
        window.location.hash = "#dashboard";   // restaurant partner
    } else {
        window.location.hash = "#home";        // normal user
    }
}

      return res;
    } catch (err) {
      console.log(err);

      setLoading(false);
      $form.addClass("is-error");

      if (authType === "login" || authType === "register") {
        $("#email").addClass("is-invalid");
        $("#password").addClass("is-invalid");
      } else if (authType === "forgotPassword") {
        const $forgotEmail =
          $("#forgotWrap #email").length
            ? $("#forgotWrap #email")
            : $("#forgotWrap input[type='email']").first();

        if ($forgotEmail.length) $forgotEmail.addClass("is-invalid");
        else $("#email").addClass("is-invalid");
      }

      toggleSubmit();
    }
  });

  // Autofocus first visible input
  setTimeout(() => {
    $("#auth01 input:visible:first").focus();
  }, 50);
};

export default load;

$(document).on("keypress", "#authForm input", function(e){
  if(e.key === "Enter"){
    e.preventDefault();
    $("#authForm").submit();
  }
});

$(document).on("submit", "#forgot-password-form", function (e) {
  e.preventDefault();

  const newPassword = $("#newPassword").val().trim();
  const confirmPassword = $("#confirmPassword").val().trim();

  if (!newPassword || !confirmPassword) {
    Swal.fire("Error", "Please fill in all fields.", "error");
    return;
  }

  if (newPassword.length < 6) {
    Swal.fire("Error", "Password must be at least 6 characters.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire("Error", "Passwords do not match.", "error");
    return;
  }

  // Simulate reset
  localStorage.setItem("restb:password", newPassword);

  Swal.fire("Success", "Password reset successfully!", "success")
    .then(() => {
      window.location.hash = "login";
    });
});