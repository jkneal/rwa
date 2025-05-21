import _ from 'lodash'
const initAnalytics = (trackingId, iu_application_code, iu_application_descr, profile) => {
    if (!trackingId || !iu_application_code || _.isEmpty(profile)) {
        return
    }

    const script = document.createElement('script')

    script.src = "https://www.googletagmanager.com/gtag/js?id=" + trackingId
    script.async = true

    const onScriptLoad = () => {
        function getStartGaConfig () {
            const {analyticsId} = profile || {}

            return {
                user_id: analyticsId
            }
        }

        function getGaUserProperties () {
            const {affiliate, campus, departmentCode, departmentDesc, employee, student} = profile || {}
            return {
                iu_application_code,
                iu_application_descr,
                iu_campus: campus || 'unknown',
                iu_department_code: departmentCode || 'unknown',
                iu_department_descr: departmentDesc || 'unknown',
                iu_is_affiliate: affiliate || false,
                iu_is_employee: employee || false,
                iu_is_student: student || false
            }
        }

        window.dataLayer = window.dataLayer || []
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag

        const userProps = getGaUserProperties()
        const config = getStartGaConfig()
        gtag('js', new Date())
        gtag('set', 'user_properties', userProps)
        gtag('config', trackingId, config)
        gtag('event', 'page_view', {
            page_path: window.location.pathname,
            page_title: document.title,
            page_location: window.location.href
        });
    }

    script.addEventListener('load', onScriptLoad)
    script.addEventListener('error', () => {
        console.log("Error loading google tag manager")
        document.body.removeChild(script)
    })

    document.body.appendChild(script)

}

export default initAnalytics