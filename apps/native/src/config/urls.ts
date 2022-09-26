import { API_URL } from '@env'

import { SERVER_URL, SOCKETIO_URL as _SOCKETIO_URL, isProd } from '@online-library/config'

// CANNOT be moved to @online-library/config/src.utils/urls.ts beacuse API_URL is then undefined

export const SERVER_NATIVE_URL = isProd ? SERVER_URL : API_URL

export const SOCKETIO_URL = isProd ? _SOCKETIO_URL : `${API_URL}/socket.io`