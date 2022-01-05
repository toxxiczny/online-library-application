import { StrictMode } from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from 'styled-components'
import { ApolloProvider } from '@apollo/client'

import * as serviceWorkerRegistration from './serviceWorkerRegistration'

import { store, persistor } from 'redux/store'

import { theme } from 'assets/styles/theme'
import 'assets/styles/index.scss'

import Wrapper from 'components/shared/Wrapper/Wrapper'
import Loader from 'components/shared/Loader/Loader'

import App from 'components/App'

import { client } from 'gql/client'

declare global {
    interface Window {
        FB: any
    }
}

render(
    <StrictMode>
        <Provider store={store}>
            <PersistGate loading={<Loader />} persistor={persistor}>
                <ThemeProvider theme={theme}>
                    <ApolloProvider client={client}>
                        <Wrapper>
                            <App />
                        </Wrapper>
                    </ApolloProvider>
                </ThemeProvider>
            </PersistGate>
        </Provider>
    </StrictMode>,
    document.getElementById('root')
)

serviceWorkerRegistration.register({
    onUpdate: async registration => {
        await registration.unregister()
        window.location.reload()
    }
})