import { Router } from 'express'

import { facebookAuthorization } from 'middlewares'

import {
   activateAccount,
   changePassword,
   checkPasswordToken,
   login,
   loginWithFacebook,
   recoverPassword,
   register,
   resendActivationToken,
} from '../services/auth'

export const Auth = Router()

Auth.post(
   /**
      #swagger.summary = "Account registration"
      #swagger.description = `
         ✅ Checks if user already exist <br />
         ✅ Generates an <b>activation token</b> <br />
         ✅ Sends link with the <b>token</b> to allow user activate his account <br />
      `
      #swagger.requestBody = {
         required: true,
         schema: { $ref: "#/definitions/register" }
      }      
      #swagger.responses[200] = {
         description: 'Activate account by clicking the link that has been sent to you',
      }  
      #swagger.responses[409] = {
         description: 'Email address already taken',
      }  
      #swagger.responses[502] = {
         description: 'There was a problem sending the activation link',
      }  
*/
   '/register', // TODO: get urls from API[...]
   ...register
)

Auth.post(
   /**
      #swagger.summary = "Account activation"
      #swagger.description = `
         ✅ Check if user already activated his account <br />
         ✅ Toggles account as activated if it's not alread <br />
      `
      #swagger.requestBody = {
         required: true,
         schema: { $ref: "#/definitions/activateAccount" }
      }  
      #swagger.responses[200] = {
         description: 'Account activated, you can login now',
      }  
      #swagger.responses[409] = {
         description: 'No authentication associated with this link',
      }  
      #swagger.responses[403] = {
         description: 'Account already activated',
      }  
*/
   '/activate-account',
   ...activateAccount
)

Auth.post(
   /**
      #swagger.summary = "Account activation"
      #swagger.description = `
         ✅ Ensures user with provided email address exists <br />
         ✅ Rejects resending activation token if account is already activate <br />
         ✅ Sends new activation token to the use <br />
      `
      #swagger.requestBody = {
         required: true,
         schema: { $ref: "#/definitions/resendActivationToken" }
      }  
      #swagger.responses[200] = {
         description: 'Link with new activation token has been sent',
      }  
      #swagger.responses[404] = {
         description: 'Provided email address is invalid',
      }  
      #swagger.responses[403] = {
         description: 'Account already activated',
      }  
      #swagger.responses[502] = {
         description: 'There was a problem sending the activation link',
      }  
*/
   '/activation-token-resend',
   ...resendActivationToken
)

Auth.post(
   /**
      #swagger.summary = "Authentication"
      #swagger.description = `
         ✅ Checks given email and password <br />
         ✅ Check if account is activated <br />
         ✅ Sends auth token, that expires in 24h, if credentials are ok<br />
      `
      #swagger.requestBody = {
         required: true,
         schema: { $ref: "#/definitions/login" }
      }  
      #swagger.responses[200] = {
         description: 'Auth token was set in cookies',
      }  
      #swagger.responses[401] = {
         description: 'The given credentials are wrong',
      }  
      #swagger.responses[403] = {
         description: 'Account not activated',
      }  
*/
   '/login',
   ...login
)

Auth.post(
   /**
      #swagger.summary = "Authentication"
      #swagger.description = `
         ✅ Verifies <b>access token</b> provided by FB auth <br />
         ✅ Sends <b>auth token</b>, that expires in 24h, for either already existing user or newly created one <br />
      `
      #swagger.requestBody = {
         required: true,
         schema: { $ref: "#/definitions/loginWithFacebook" }
      }  
      #swagger.responses[200] = {
         description: 'Auth token was set in cookies',
      }  
      #swagger.responses[400] = {
         description: 'FB authentication has failed',
      }  
*/
   '/login/fb',
   facebookAuthorization,
   ...loginWithFacebook
)

Auth.post(
   /**
      #swagger.summary = "Password recovery"
      #swagger.description = `
         ✅ Checks if any user belongs to provided email address <br />
         ✅ Makes sure that user account is activated <br />
         ✅ Generates <b>password token</b> to authorize changing password in the next step (password form) <br />
      `
      #swagger.requestBody = {
         required: true,
         schema: { $ref: "#/definitions/recoverPassword" }
      }  
      #swagger.responses[200] = {
         description: 'Link to reset the password has been sent',
      }  
      #swagger.responses[404] = {
         description: 'An incorrect email address was provided',
      }  
      #swagger.responses[409] = {
         description: 'Account must be firstly activated',
      } 
      #swagger.responses[502] = {
         description: 'There was a problem sending the link to reset password',
      }  
*/
   '/password-recovery',
   ...recoverPassword
)

Auth.post(
   /**
      #swagger.summary = "Password recovery"
      #swagger.description = `
         ✅ Checks password token generated by <b>/api/user/auth/recoverPassword</b> <br />
         ✅ Checks if there is a user with email address as kept in password token <br />
      `
      #swagger.requestBody = {
         required: true,
         schema: { $ref: "#/definitions/checkPasswordToken" }
      }  
      #swagger.responses[200] = {
         description: 'Password token is valid',
      }  
      #swagger.responses[400] = {
         description: 'Link to reset the password is invalid',
      }  
*/
   '/password-token-check',
   ...checkPasswordToken
)

Auth.put(
   /**
      #swagger.summary = "Password change"
      #swagger.description = `
         ✅ Changes user password <br />
      `
      #swagger.requestBody = {
         required: true,
         schema: { $ref: "#/definitions/changePassword" }
      } 
      #swagger.responses[200] = {
         description: 'Password has been changed',
      }
      #swagger.responses[400] = {
         description: 'Link to reset the password is invalid',
      }
*/
   '/password-change',
   ...changePassword
)
