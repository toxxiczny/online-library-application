import jwt from 'jsonwebtoken'

import { API, ApiError, yup } from 'online-library'

import { JWT_KEY, TokenExpiration } from 'config'

import { Connection, User } from 'database'

import { yupValidation } from 'middlewares'

import { transporter } from 'helpers'

import { baseUrl, emailTemplate } from 'utils'

import type { Body, Route } from 'types/express'

const { header, post, validation } = API.register

const schema = yup.object({ body: validation })

export const register: Route<Body<typeof schema>> = [
   yupValidation({ schema }),
   async (req, res, next) => {
      try {
         await Connection.transaction(async transaction => {
            const { name, email, password } = req.body

            const user = await User.findOne({ where: { email } })

            if (user) {
               throw new ApiError(header, post[409], 409)
            }

            const activationToken = jwt.sign({ email }, JWT_KEY, {
               expiresIn: TokenExpiration['24h'],
            })

            const createdUser = await User.create(
               {
                  name,
                  email,
                  password,
               },
               { transaction }
            )

            await createdUser.createAuthentication({ activationToken })

            try {
               await transporter.sendMail({
                  to: email,
                  subject: `${header} in the Online Library`,
                  html: emailTemplate(
                     `${header} in the Online Library`,
                     `To activate your account click the button`,
                     'Activate account',
                     `${baseUrl(req)}/activation/${activationToken}`
                  ),
               })
            } catch {
               throw new ApiError(header, post[502], 502)
            }

            res.send()
         })
      } catch (error) {
         next(error)
      }
   },
]
