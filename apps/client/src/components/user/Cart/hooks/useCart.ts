import { useEffect, useState } from 'react'

import { API } from 'online-library'

import { useGetBooksQuery } from 'gql'

import { useCart as useCartHook, useQueryParams } from 'hooks'

import { setApiFeedback } from 'helpers'

import { axios, history } from 'utils'

export const useCart = () => {
   const { paymentId, PayerID } = useQueryParams()

   const { cart, resetCart } = useCartHook()

   const { data } = useGetBooksQuery({ variables: { ids: cart } })

   const [price, setPrice] = useState('')

   const books = data?.books || []

   useEffect(() => {
      let total = 0

      books.map(({ price }) => (total += price || 0))

      setPrice(total.toFixed(2))
   }, [books])

   useEffect(() => {
      const executePayPalPayment = async () => {
         try {
            if (paymentId && PayerID) {
               await axios
                  .post(API.CART.executePayPalPayment.url, {
                     paymentId,
                     PayerID,
                  })
                  .then(() => {
                     setApiFeedback(
                        'Submitting the order',
                        `You have successfully purchased new books`,
                        'Check them out in your profile',
                        () => {
                           resetCart()
                           history.push('/profile')
                        }
                     )
                  })
            }
         } catch (error) {
            if ((error as ApiError).response.status === 409) {
               resetCart()
               history.push('/profile')
            }
         }
      }
      executePayPalPayment()
   }, [paymentId, PayerID])

   const createPayPalPayment = async () => {
      const response = await axios.post(API.CART.createPayPalPayment.url, { products: cart })
      if (response) {
         window.location = response.data.link
      }
   }

   return {
      books,
      price,
      createPayPalPayment,
   }
}