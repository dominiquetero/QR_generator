import{_ as c}from"./AppLayout-BwAUJ9t7.js";import p from"./DeleteUserForm-DNW_tH6y.js";import l from"./LogoutOtherBrowserSessionsForm-CfxRpai0.js";import{S as s}from"./SectionBorder-_2wrr42v.js";import f from"./TwoFactorAuthenticationForm-DWxZu-n9.js";import u from"./UpdatePasswordForm-BXX4vR1o.js";import _ from"./UpdateProfileInformationForm-BimhSrHY.js";import{o,c as d,w as n,a as i,e as r,b as t,f as a,F as h}from"./app-CYrqgkBb.js";import"./_plugin-vue_export-helper-DlAUqK2U.js";import"./DialogModal-wWSWh6G0.js";import"./SectionTitle-DBYghL5a.js";import"./DangerButton-CtP0YvvT.js";import"./TextInput-DpSwwQec.js";import"./SecondaryButton-B3rG6x5h.js";import"./ActionMessage-D9t2cxNq.js";import"./PrimaryButton-CP_fFvaU.js";import"./InputLabel-CVI4JHfu.js";import"./FormSection-BiXqZW_v.js";const g=i("h2",{class:"font-semibold text-xl text-gray-800 leading-tight"}," Profile ",-1),$={class:"max-w-7xl mx-auto py-10 sm:px-6 lg:px-8"},w={key:0},k={key:1},y={key:2},z={__name:"Show",props:{confirmsTwoFactorAuthentication:Boolean,sessions:Array},setup(m){return(e,x)=>(o(),d(c,{title:"Profile"},{header:n(()=>[g]),default:n(()=>[i("div",null,[i("div",$,[e.$page.props.jetstream.canUpdateProfileInformation?(o(),r("div",w,[t(_,{user:e.$page.props.auth.user},null,8,["user"]),t(s)])):a("",!0),e.$page.props.jetstream.canUpdatePassword?(o(),r("div",k,[t(u,{class:"mt-10 sm:mt-0"}),t(s)])):a("",!0),e.$page.props.jetstream.canManageTwoFactorAuthentication?(o(),r("div",y,[t(f,{"requires-confirmation":m.confirmsTwoFactorAuthentication,class:"mt-10 sm:mt-0"},null,8,["requires-confirmation"]),t(s)])):a("",!0),t(l,{sessions:m.sessions,class:"mt-10 sm:mt-0"},null,8,["sessions"]),e.$page.props.jetstream.hasAccountDeletionFeatures?(o(),r(h,{key:3},[t(s),t(p,{class:"mt-10 sm:mt-0"})],64)):a("",!0)])])]),_:1}))}};export{z as default};
