import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {Route, Routes, useNavigate} from 'react-router-dom'
import {
    Badge,
    BaseHeader,
    BaseHeaderMenu,
    BaseHeaderMenuItem,
    BaseHeaderNavigation,
    HeaderAvatar,
    StandardFooter
} from 'rivet-react'
import appActions from './reducers/app'
import {createShortName} from './util/common'
import loader from './util/loader'
import Backdoor from './components/Backdoor'
import Home from './pages/Home'
import Arrangement from './pages/Arrangement'
import ReviewArrangement from './pages/ReviewArrangement'
import AttestationText from './pages/admin/AttestationText'
import EditAttestationText from './pages/admin/EditAttestationText'
import ErrorPage from './pages/ErrorPage'
import Unauthorized from './pages/Unauthorized'
import ArrangementsLookup from './pages/admin/ArrangementsLookup'
import initAnalytics from './util/initAnalytics'
import 'rivet-icons/dist/rivet-icons.css'
import 'rivet-icons/dist/rivet-icons.js'
import 'rivet-icons/dist/rivet-icon-element.js'
import './app.css'

export let navigate = () => {}

const App = ({user, env}) => {
    navigate = useNavigate()

    useEffect(() => {
        if (user && env) {
            initAnalytics(env.analyticsTrackingId, 'ebs/rwa',
                'EBS - Remote Work Arrangement', user)
        }
    }, [user, env])
    return (
        <div className="appContainer">
            <Header user={user} />

            {env && env.testEnvironment && <div><Badge className="testenv-badge" variant="warning">{env.testEnvironment}</Badge></div>}

            <main id="main-content">
                <Routes>
                    <Route exact path="/error" element={<ErrorPage/>}/>
                    <Route exact path="/unauthorized" element={<Unauthorized/>}/>
                    <Route exact path="/" element={<Home/>}/>
                    <Route path="/arrangement/new" element={<Arrangement/>}/>
                    <Route path="/arrangement/update" element={<Arrangement/>}/>
                    <Route path="/arrangement/review/:documentNumber" element={<ReviewArrangement/>}/>
                    {user && user.admin && <Route exact path="/admin/attestation" element={<AttestationText/>}/>}
                    {user && (user.admin || user.reviewer) && <Route exact path="/admin/arrangements" element={<ArrangementsLookup/>}/>}
                    {user && user.admin && <Route path="/admin/attestation/edit" element={<EditAttestationText/>}/>}
                </Routes>
            </main>

            <StandardFooter privacyUrl="/privacyPolicy" size="full" variant="light" />
        </div>
    )
}

const Header = (props) => {
    const { user } = props
    const { impersonating, preferredName } = user
    const logout = () => {
        window.location = '/doLogout'
    }
    const username = (impersonating ? 'Impersonating ' : '') + preferredName
    const avatar = (
        <HeaderAvatar
            shortName={createShortName(user)}
            username={username}
        />
    )
    return (
        <BaseHeader
            headerWidth="xxl"
            homeUrl="/"
            padding={{left: "sm", right: "sm"}}
            title="Remote Work Arrangement"
        >
            <BaseHeaderNavigation>
                {user.admin && <BaseHeaderMenuItem id="attestation-link" itemUrl='/admin/attestation'>Attestation</BaseHeaderMenuItem>}
                {(user.admin || user.reviewer) && <BaseHeaderMenuItem id="arrangements-link" itemUrl='/admin/arrangements'>Arrangements</BaseHeaderMenuItem>}
                <BaseHeaderMenuItem>
                    <BaseHeaderMenu
                        data-cy='userMenu'
                        label={avatar}
                        menuButtonAttrs={{['data-cy']: "userMenu__dropdown"}}
                    >
                        <Backdoor userInfo={user}/>
                        <li><button onClick={logout}>Log out</button></li>
                    </BaseHeaderMenu>
                </BaseHeaderMenuItem>
            </BaseHeaderNavigation>
        </BaseHeader>
    )
}

const stateToProps = ({app}) => {
    return {
        user: app.user,
        env: app.env
    }
}

const dispatchToProps = (dispatch, ownProps) => {
    return {
        onLoad: () => {
            dispatch(appActions.fetchEnvironment())

            if (window.location.pathname !== '/unauthorized' && window.location.pathname !== '/error') {
                dispatch(appActions.fetchUser)
            }
        }
    }
}

export default connect(stateToProps, dispatchToProps)(loader(App))
