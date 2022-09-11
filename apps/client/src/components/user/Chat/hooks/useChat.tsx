import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { API, filesInfo } from '@online-library/tools'

import { useMessagesInfo, useSocket } from 'hooks'

import { handleApiError, setApiFeedback, subscribePushNotifications } from 'helpers'

import { apiAxios, defaultAxios } from 'utils'

import type { GetMessagesResponse, MessageType, SendFileResponse } from 'types'

type UseChatProps = {
   setLoading: ReactDispatch<boolean>
   setShowFileInput: ReactDispatch<boolean>
   setPercentage: ReactDispatch<number>
}

let intervalId: ReturnType<typeof setInterval>

export const useChat = ({ setLoading, setShowFileInput, setPercentage }: UseChatProps) => {
   const { socket } = useSocket()

   const { lastUnreadMessageIndex, setUnreadMessagesAmount } = useMessagesInfo()

   const messagesRef = useRef<HTMLDivElement>(null)
   const endOfMessages = useRef<HTMLDivElement>(null)

   const [currentUserId, setCurrentUserId] = useState<string>('')
   const [currentUserName, setCurrentUserName] = useState<string>('')

   const [messages, setMessages] = useState<MessageType[]>([])
   const [message, setMessage] = useState('')
   const [hasMoreMessages, setHasMoreMessages] = useState(true)

   const getMessages = async (
      limit: number,
      offset: number,
      event: React.UIEvent<HTMLDivElement> | undefined
   ) => {
      if (event) {
         const target = event.target as HTMLDivElement
         if (target.scrollTop <= 0 && hasMoreMessages) {
            const response = await apiAxios<GetMessagesResponse>(
               API['/api/user/chat/messages'].post,
               {
                  limit,
                  offset,
               }
            )

            if (response) {
               const { messages: loadedMessages } = response.data

               setHasMoreMessages(loadedMessages.length !== 0)

               const lastScroll = target.scrollHeight

               setMessages(messages => [...loadedMessages, ...messages])

               target.scrollTop = target.scrollHeight - lastScroll

               if (lastUnreadMessageIndex) {
                  if (loadedMessages.length + messages.length >= lastUnreadMessageIndex) {
                     setUnreadMessagesAmount(0)
                  }
               }
            }
         }
      } else {
         const response = await apiAxios<GetMessagesResponse>(API['/api/user/chat/messages'].post, {
            limit,
            offset,
         })
         if (response) {
            setLoading(false)

            const { messages, userId, userName } = response.data

            setCurrentUserId(userId)
            setCurrentUserName(userName)

            setMessages(messages)

            pushToLastMessage()

            if (lastUnreadMessageIndex) {
               if (messages.length >= lastUnreadMessageIndex) {
                  setUnreadMessagesAmount(0)
               }
            }
         }
      }
   }

   useEffect(() => {
      getMessages(20, 0, undefined)
      setTimeout(() => {
         subscribePushNotifications()
      }, 2000)
   }, [])

   useEffect(() => {
      const handleOnSendMessage = (message: MessageType) => {
         setMessages(messages => [...messages, message])

         if (message.type === 'MESSAGE' || message.type === 'FILE') {
            scrollToLastMessage(0)
         }

         socket?.emit('readMessages')
      }

      if (socket) {
         socket.on('sendMessage', handleOnSendMessage)
      }

      return () => {
         if (socket) {
            socket.off('sendMessage', handleOnSendMessage)
         }
      }
   }, [socket])

   const getUnreadMessages = async () => {
      const response = await apiAxios<GetMessagesResponse>(API['/api/user/chat/messages'].post, {
         limit: lastUnreadMessageIndex,
         offset: 0,
      })

      if (response) {
         const { messages } = response.data

         setMessages(messages)

         setTimeout(() => {
            if (messagesRef.current) {
               messagesRef.current.scrollTop = 1
            }
         }, 0)

         setUnreadMessagesAmount(0)
      }
   }

   const scrollToLastMessage = (delay: number) => {
      setTimeout(() => {
         endOfMessages.current && endOfMessages.current.scrollIntoView({ behavior: 'smooth' })
      }, delay)
   }

   const pushToLastMessage = () => {
      setTimeout(() => {
         const messages = messagesRef.current
         messages && (messages.scrollTop = messages.scrollHeight)
      }, 0)
   }

   const sendMessage = async () => {
      if (message.trim()) {
         const lastMessage = messages[messages.length - 1]

         const id = lastMessage ? lastMessage.id + 1 : 0

         const _message: MessageType = {
            id,
            type: 'MESSAGE',
            content: message,
            userId: currentUserId,
            user: { name: currentUserName },
            createdAt: new Date().toString(),
         }

         setMessages(messages => [...messages, _message] as MessageType[])

         pushToLastMessage()

         setTimeout(() => {
            setMessage('')
         }, 0)

         try {
            await defaultAxios(API['/api/user/chat/message'].post, { content: message.trim() })
            socket?.emit('sendMessage', _message)
         } catch (error) {
            const conversation = messages

            setMessages(conversation)

            handleApiError(error)
         }
      }
   }

   const sendFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { post } = API['/api/user/chat/file']

      let percentage = 0

      const file = event.currentTarget.files?.[0]

      if (file) {
         const {
            regex: { images, videos, files },
            sizes: { maxImageSize, maxVideoSize, maxFileSize },
         } = filesInfo

         const { name, size } = file

         const isImage = images.test(name)
         const isVideo = videos.test(name)
         const isFile = files.test(name)

         const resetFileInput = () => {
            setShowFileInput(false)
            setTimeout(() => {
               setShowFileInput(true)
            }, 500)
         }

         const largeSizeError = () => {
            return setApiFeedback(post.header, post.errors[413])
         }

         if (!isImage && !isVideo && !isFile) {
            resetFileInput()
            return setApiFeedback(post.header, post.errors[415])
         }

         if (isImage) {
            if (size > maxImageSize) {
               resetFileInput()
               largeSizeError()
            }
         }

         if (isVideo) {
            if (size > maxVideoSize) {
               resetFileInput()
               largeSizeError()
            }
         }

         if (isFile) {
            if (size > maxFileSize) {
               resetFileInput()
               largeSizeError()
            }
         }

         const form = new FormData()

         form.append('file', file)

         try {
            intervalId = setInterval(() => {
               if (percentage < 100) {
                  percentage++
                  setPercentage(percentage => percentage + 1)
               }
            }, 500)

            const response = await defaultAxios<SendFileResponse>(post, form)

            if (response) {
               setPercentage(100)

               clearInterval(intervalId)

               setTimeout(() => {
                  setPercentage(0)
               }, 800)

               const { type, content } = response.data

               const lastMessage = messages[messages.length - 1]

               const id = lastMessage ? lastMessage.id + 1 : 0

               const message: MessageType = {
                  id,
                  type,
                  content,
                  filename: name,
                  userId: currentUserId,
                  user: { name: currentUserName },
                  createdAt: new Date().toString(),
               }

               setMessages([...messages, message] as MessageType[])

               scrollToLastMessage(0)

               resetFileInput()

               socket?.emit('sendMessage', message)
            }
         } catch (error) {
            handleApiError(error)

            resetFileInput()

            clearInterval(intervalId)

            setPercentage(0)
         }
      }
   }

   return {
      messagesRef,
      endOfMessages,
      currentUserId,
      messages,
      message,
      setMessage,
      getMessages,
      getUnreadMessages,
      sendMessage,
      sendFile,
      scrollToLastMessage,
   }
}
