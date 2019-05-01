import React from 'react';
import $ from 'jquery'
import uuid from 'uuid'

import { modalAnimations } from '../../animations/modalAnimations'

export const sortFreeBooks = (books, setTitle, setAuthor, setCover) => {
    const result = books.map(book => {
        const imageUrl = btoa(new Uint8Array(book.cover.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''));
        return (
            <div className="free-book-item relative" style={{ background: `url(data:image/jpeg;base64,${imageUrl}) no-repeat center center`, backgroundSize: 'cover' }} key={uuid()}>
                <div className="free-book-title book-title">{book.title}</div>
                <button className="free-book-button book-button button absolute" onClick={() => {
                    setTitle(book.title);
                    setAuthor(book.author);
                    setCover(imageUrl);
                    $('.modal').css('display', 'block');
                    modalAnimations();
                }}>Borrow</button>
            </div>
        )
    })
    return result;
}

export const sortPaidBooks = (books, setTitle, setAuthor, setPrice, setCover) => {
    const result = books.map(book => {
        const imageUrl = btoa(new Uint8Array(book.cover.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''));
        return (
            <div className="paid-book-item relative" style={{ background: `url(data:image/jpeg;base64,${imageUrl}) no-repeat center center`, backgroundSize: 'cover' }} key={uuid()}>
                <div className="paid-book-title book-title">{book.title}</div>
                <div className="paid-book-price book-price">{book.price + "$"}</div>
                <button className="paid-book-button book-button button absolute" onClick={() => {
                    setTitle(book.title);
                    setAuthor(book.author);
                    setPrice(book.price);
                    setCover(imageUrl);
                    $('.modal').css('display', 'block');
                    modalAnimations();
                }}>Buy</button>
            </div>
        )
    })
    return result;
}