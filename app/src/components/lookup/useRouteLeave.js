import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

const useRouteLeave = routeLeaveFn => {
    const [windowLocation, setWindowLocation] = useState(window.location.pathname)

    let routeLeaveFns = Array.isArray(routeLeaveFn) ? routeLeaveFn : [routeLeaveFn]
    let navigate = useNavigate()
    useEffect(() => {
        return navigate.listen(location => {
            if (location.pathname !== windowLocation) {
                setWindowLocation(window.location.pathname)
                routeLeaveFns.forEach(rlf => rlf && rlf(location))
            }
        })
    }, [windowLocation])
}

export default useRouteLeave
