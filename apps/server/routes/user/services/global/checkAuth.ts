import { verify } from 'jsonwebtoken'

import type { Role } from '@online-library/tools'
import { AuthError, yup } from '@online-library/tools'

import { JWT_KEY } from 'config'

import { yupValidation } from 'middlewares'

import { cookie, jwt } from 'utils'

import type { AuthTokenData } from 'types'
import type { Cookies, InitialBody, Route } from 'types/express'

const schema = yup.object({ cookies: yup.object({ authToken: jwt.optional() }) })

export const checkAuth: Route<InitialBody, Cookies<typeof schema>> = [
   yupValidation({ schema }),
   async (req, res, next) => {
      try {
         const { authToken } = req.cookies

         if (!authToken) {
            return res.clearCookie('authToken', cookie()).send({ role: 'guest' as Role })
         }

         const { role } = verify(authToken, JWT_KEY) as AuthTokenData

         if (role === 'user') {
            return res.send({ role: 'user' as Role })
         }

         throw AuthError
      } catch (error) {
         next(error)
      }
   },
]
