import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import fileSaver from 'file-saver'

import StyledMessage from '../styled/Message'

const MessageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    align-self: flex-start;
    cursor: pointer;
    position: relative;
    ${({ withCurrentUser }) =>
        withCurrentUser &&
        css`
            align-self: flex-end;
        `}
    ${({ withLastUserMessage }) =>
        withLastUserMessage &&
        css`
            margin-bottom: 20px;
        `}
`

const Message = ({
    type,
    content,
    userId,
    userName,
    createdAt,
    currentUserId,
    nextMessage,
    scrollToLastMessage,
    withLastMessage
}) => {
    const [shouldDetailsAppear, setShouldDetailsAppear] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [videoError, setVideoError] = useState(false)
    const date = new Date(createdAt)
    const withCurrentUser = userId === currentUserId
    const withLastUserMessage = (nextMessage && userId !== nextMessage.userId) || !nextMessage
    const withFile = type === 'FILE'
    useEffect(() => scrollToTheBottom(), [])
    useEffect(
        () => shouldDetailsAppear && setTimeout(() => setShouldDetailsAppear(false), 3000),
        [shouldDetailsAppear]
    )
    const scrollToTheBottom = () => withLastMessage && scrollToLastMessage(0)
    const handleFileLoadingError = () =>
        type === 'IMAGE' ? setImageError(true) : setVideoError(true)
    const showError = error => (
        <StyledMessage.Content
            withCurrentUser={withCurrentUser}
            withLastUserMessage={withLastUserMessage}
            withError
        >
            {error}
            {withLastUserMessage && showAvatar()}
        </StyledMessage.Content>
    )
    const showAvatar = () => (
        <StyledMessage.Avatar withCurrentUser={withCurrentUser}>
            {userName.charAt(0)}
        </StyledMessage.Avatar>
    )
    return (
        <MessageContainer
            onClick={() => setShouldDetailsAppear(true)}
            withCurrentUser={withCurrentUser}
            withLastUserMessage={withLastUserMessage && nextMessage}
        >
            {type === 'IMAGE' ? (
                !imageError ? (
                    <StyledMessage.Container>
                        <StyledMessage.Image
                            src={content}
                            onLoad={scrollToTheBottom}
                            onError={handleFileLoadingError}
                        />
                        {withLastUserMessage && showAvatar()}
                    </StyledMessage.Container>
                ) : (
                    showError('Image failed to load')
                )
            ) : type === 'VIDEO' ? (
                !videoError ? (
                    <StyledMessage.Container>
                        <StyledMessage.Video
                            src={content}
                            controls
                            onLoadStart={scrollToTheBottom}
                            onError={handleFileLoadingError}
                        />
                        {withLastUserMessage && showAvatar()}
                    </StyledMessage.Container>
                ) : (
                    showError('Video failed to load')
                )
            ) : (
                <StyledMessage.Content
                    onClick={() =>
                        withFile && fileSaver.saveAs(content, content.split('filename')[1])
                    }
                    withCurrentUser={withCurrentUser}
                    withLastUserMessage={withLastUserMessage}
                    withFile={withFile}
                >
                    {withFile ? content.split('filename')[1] : content}
                    {withLastUserMessage && showAvatar()}
                </StyledMessage.Content>
            )}
            {(withLastUserMessage || shouldDetailsAppear) && (
                <StyledMessage.Date
                    withCurrentUser={withCurrentUser}
                    withLastUserMessage={withLastUserMessage}
                    shouldDetailsAppear={shouldDetailsAppear}
                >
                    {new Date().toDateString() === date.toDateString()
                        ? date.toLocaleTimeString()
                        : date.toLocaleString()}
                </StyledMessage.Date>
            )}
        </MessageContainer>
    )
}

export default Message