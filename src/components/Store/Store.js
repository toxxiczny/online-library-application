import React, { useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import getCookie from '../../resources/helpers/getCookie'

import MainBackground from '../../assets/img/MainBackground.jpg'
import Navbar from '../../sharedComponents/Navbar/Navbar'
import StoreBooks from './StoreBooks/StoreBooks'
import BookUploader from '../../sharedComponents/BookUploader/BookUploader'
import StoreModal from './StoreModal/StoreModal'

const StoreWrapper = styled.div`
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(${MainBackground}) center center no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const Store = props => {
    const shouldBookUploaderAppear = useSelector(state => state.global.shouldBookUploaderAppear)
    const shouldStoreModalAppear = useSelector(state => state.global.shouldStoreModalAppear)
    useLayoutEffect(() => {
        if (!getCookie('token')) props.history.push('/login')
    }, [])
    return (
        <StoreWrapper>
            <Navbar store />
            <StoreBooks />
            {shouldBookUploaderAppear && <BookUploader />}
            {shouldStoreModalAppear && <StoreModal />}
        </StoreWrapper>
    )
}

export default Store