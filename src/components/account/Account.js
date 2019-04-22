import React, { Component } from 'react'

import axios from 'axios'
import uuid from 'uuid'
import { accountAnimations } from '../../animations/AccountAnimations'
import $ from 'jquery'
import anime from 'animejs'
import { setCheckedOutBooks, setBoughtBooks, setEmail, setFreeBooks, setPaidBooks, setCart } from '../../actions/user'
import { connect } from 'react-redux'

export class Account extends Component {
    _isMounted = false;
    state = {
        booktitle: "",
        freebooks: [],
        paidbooks: [],
        modalBookTitle: "",
        modalBookAuthor: "",
        modalBookCover: "",
        modalBookPrice: "",
        successMessage: "",
        errorMessage: "",
        cart: ""
    }
    async componentDidMount() {

        this._isMounted = true;
        !sessionStorage.getItem('jwt') && this.props.history.push('/login');

        function sortBooks(paidBooks, freeBooks, handleCheckOutModal, handleBuyModal) {
            const paidbooks = paidBooks.map(book => {
                const imageUrl = btoa(new Uint8Array(book.cover.data.data).reduce(function (data, byte) {
                    return data + String.fromCharCode(byte);
                }, ''));
                book.coverUrl = imageUrl;
                return (
                    <div className="book" style={{ background: `url(data:image/jpeg;base64,${imageUrl}) no-repeat center center`, backgroundSize: 'cover' }} key={uuid()}>
                        <h4 className="title">{book.title}</h4>
                        <div className="buy-details">
                            <h4 className="price">{book.price + "$"}</h4>
                            <button className="buy-button" onClick={() => handleBuyModal(book.title, book.author, book.price, imageUrl)}>Buy</button>
                        </div>
                    </div>
                )
            })
            const freebooks = freeBooks.map(book => {
                const imageUrl = btoa(new Uint8Array(book.cover.data.data).reduce(function (data, byte) {
                    return data + String.fromCharCode(byte);
                }, ''));
                book.coverUrl = imageUrl;
                return (
                    <div className="book" style={{ background: `url(data:image/jpeg;base64,${imageUrl}) no-repeat center center`, backgroundSize: 'cover' }} key={uuid()}>
                        <h4 className="title">{book.title}</h4>
                        <button className="checkout-button" onClick={() => handleCheckOutModal(book.title, book.author, book.coverUrl)}>Check out</button>
                    </div>
                )
            })
            return {
                freebooks,
                paidbooks
            }
        }

        if (this._isMounted) {

            this.setState({
                cart: this.props.cart
            })

            if (this.props.freebooks.length === 0 && this.props.paidbooks.length === 0) {
                const gettingBooksProcess = await axios.get('/getBooks');
                const freebooks = gettingBooksProcess.data.freebooks;
                const paidbooks = gettingBooksProcess.data.paidbooks;
                this.props.setFreeBooks(freebooks);
                this.props.setPaidBooks(paidbooks);
                this.setState(sortBooks(this.props.paidbooks, this.props.freebooks, this.handleCheckOutModal, this.handleBuyModal));
                accountAnimations();
            } else {
                this.setState(sortBooks(this.props.paidbooks, this.props.freebooks, this.handleCheckOutModal, this.handleBuyModal));
            }
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    handleLogout = () => {
        sessionStorage.clear();
        this.props.setEmail("");
        this.props.setBoughtBooks([]);
        this.props.setCheckedOutBooks([]);
        this.props.setPaidBooks([]);
        this.props.setFreeBooks([]);
        this.props.history.push('/');
    }
    handleCheckOutModal = (bookTitle, bookAuthor, bookCover) => {
        this.setState({
            modalBookTitle: bookTitle,
            modalBookAuthor: bookAuthor,
            modalBookCover: bookCover
        })
        $('.modal').css('display', 'block');
        anime({
            targets: '.modal',
            scale: [2, 1],
            easing: 'easeOutElastic(1, 2)'
        });
    }
    handleCancelModal = () => {
        $('.modal').css('display', 'none');
    }
    handleCancelModal2 = () => {
        $('.modal2').css('display', 'none');
    }
    handleCheckOut = async () => {
        const checkingOutBookProcess = await axios.post('/checkOutBook', {
            email: this.props.email,
            author: this.state.modalBookAuthor,
            title: this.state.modalBookTitle,
            cover: this.state.modalBookCover
        })
        checkingOutBookProcess.data.done ? this.setState({ successMessage: checkingOutBookProcess.data.msg, errorMessage: "" }) || $('.modal').css('display', 'none') : this.setState({ successMessage: "", errorMessage: checkingOutBookProcess.data.msg }) || $('.modal').css('display', 'none');
        setTimeout(() => {
            if (this._isMounted) {
                this.setState({
                    successMessage: "",
                    errorMessage: ""
                })
            }
        }, 5000);
    }
    handleBuyModal = (bookTitle, bookAuthor, bookPrice, bookCover) => {
        this.setState({
            modalBookTitle: bookTitle,
            modalBookAuthor: bookAuthor,
            modalBookCover: bookCover,
            modalBookPrice: bookPrice
        })
        $('.modal2').css('display', 'block');
        anime({
            targets: '.modal2',
            scale: [2, 1],
            easing: 'easeOutElastic(1, 2)'
        });
    }
    handleBuy = () => {
        const book = {
            id: uuid(),
            author: this.state.modalBookAuthor,
            title: this.state.modalBookTitle,
            price: this.state.modalBookPrice,
            cover: this.state.modalBookCover
        }
        this.setState({
            cart: [...this.state.cart, book]
        }, () => {
            this.props.setCart(this.state.cart);
        })
        $('.modal2').css('display', 'none');

    }
    handleClick = (where) => {
        this.props.history.push(where)
    }
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    handleFind = async (e) => {
        e.preventDefault();
        if (this._isMounted) {
            if (this.state.booktitle !== "") {
                const gettingBooksProcess = await axios.post('/getBook', {
                    booktitle: this.state.booktitle
                });
                const book = gettingBooksProcess.data.book;
                if (gettingBooksProcess.data.done) {
                    this.setState({
                        errorMessage: "",
                    })
                    const imageUrl = btoa(new Uint8Array(book.cover.data.data).reduce(function (data, byte) {
                        return data + String.fromCharCode(byte);
                    }, ''));
                    book.coverUrl = imageUrl;
                    if ('price' in book) {
                        const paidbook = () => {
                            return (
                                <div className="book" style={{ background: `url(data:image/jpeg;base64,${imageUrl}) no-repeat center center`, backgroundSize: 'cover' }} key={uuid()}>
                                    <h4 className="title">{book.title}</h4>
                                    <div className="buy-details">
                                        <h4 className="price">{book.price + "$"}</h4>
                                        <button className="buy-button" onClick={() => this.handleBuyModal(book.title, book.author, book.price, imageUrl)}>Buy</button>
                                    </div>
                                </div>
                            )
                        }
                        const updatedPaidBooks = [paidbook(), ...this.state.paidbooks];
                        updatedPaidBooks.pop();
                        this.setState({
                            paidbooks: updatedPaidBooks
                        })
                    } else {
                        const freebook = () => {
                            return (
                                <div className="book" style={{ background: `url(data:image/jpeg;base64,${imageUrl}) no-repeat center center`, backgroundSize: 'cover' }} key={uuid()}>
                                    <h4 className="title">{book.title}</h4>
                                    <button className="checkout-button" onClick={() => this.handleCheckOutModal(book.title, book.author, book.coverUrl)}>Check out</button>
                                </div>
                            )
                        }
                        const updatedFreeBooks = [freebook(), ...this.state.freebooks];
                        updatedFreeBooks.pop();
                        this.setState({
                            freebooks: updatedFreeBooks
                        })
                    }
                } else {
                    this.setState({
                        errorMessage: gettingBooksProcess.data.msg
                    })
                }
            } else {
                this.setState({
                    errorMessage: "You have to type book's title!"
                })
            }
        }
    }
    render() {
        return (
            <div className="account">
                <div className="modal">
                    <div className="modal-content">
                        <div className="box box1">
                            <img className="book-img" src={`data:image/jpeg;base64,${this.state.modalBookCover}`} alt="book" />
                        </div>
                        <div className="box box2">
                            <div className="text">That's just a small step from checking out this book:</div>
                            <div className="bookTitle">Book written by {this.state.modalBookAuthor}</div>
                            <div className="bookTitle">Named {this.state.modalBookTitle}</div>
                        </div>
                        <div className="box box3">
                            <div className="text">I am sure I want this book</div>
                            <div className="buttons">
                                <button className="button button-yes" onClick={this.handleCheckOut}>Yes</button>
                                <button className="button button-no" onClick={this.handleCancelModal}>No</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal2">
                    <div className="modal-content">
                        <div className="box box1">
                            <img className="book-img" src={`data:image/jpeg;base64,${this.state.modalBookCover}`} alt="book" />
                        </div>
                        <div className="box box2">
                            <div className="text">That's just a small step from buying this book:</div>
                            <div className="bookTitle">Book written by {this.state.modalBookAuthor}</div>
                            <div className="bookTitle">Named {this.state.modalBookTitle}</div>
                            <div className="bookTitle">That costs {this.state.modalBookPrice}$</div>
                        </div>
                        <div className="box box3">
                            <div className="text">I am sure I buy this book right now!</div>
                            <div className="buttons">
                                <button className="button button-yes" onClick={this.handleBuy}>Yes, add to cart</button>
                                <button className="button button-no" onClick={this.handleCancelModal2}>No, close this</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="account-item navbar">
                    <ul className="navbar-logo-items">
                        <li className="navbar-logo-item">Online library</li>
                    </ul>
                    <ul className="navbar-links-items">
                        <li className="navbar-links-item"><div className="navbar-link" onClick={() => this.handleClick('/profile')}>My profile</div></li>
                        <li className="navbar-links-item"><div className="navbar-link" onClick={() => this.handleClick('/cart')}>Cart</div></li>
                        <li className="navbar-links-item"><div className="navbar-link" onClick={this.handleLogout}>Logout</div></li>
                    </ul>
                </div>
                <div className="account-item buy-book">
                    <div className="buy-book-title">
                        <h1>Buy premium books!</h1>
                    </div>
                    <div className="buy-books-container">
                        {this.state.paidbooks}
                    </div>
                </div>
                <div className="account-item find-book">
                    <div className="find-book-title">
                        <h1>Find here awesome books!</h1>
                    </div>
                    <div className="find-field">
                        <form className="find-form" onSubmit={this.handleFind}>
                            <input className="find-book-input" name="booktitle" type="text" placeholder="Type title of book..." onChange={this.handleChange} />
                            <button className="find-button">Find</button>
                        </form>
                        <div className="find-error">
                            {this.state.successMessage !== "" && <div className="success">{this.state.successMessage}</div>}
                            {this.state.errorMessage !== "" && <div className="error">{this.state.errorMessage}</div>}
                        </div>
                    </div>
                </div>
                <div className="account-item books">
                    <div className="find-books-container">
                        {this.state.freebooks}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        email: state.user.email,
        freebooks: state.user.freebooks,
        paidbooks: state.user.paidbooks,
        cart: state.user.cart
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setEmail: payload => dispatch(setEmail(payload)),
        setFreeBooks: payload => dispatch(setFreeBooks(payload)),
        setPaidBooks: payload => dispatch(setPaidBooks(payload)),
        setCheckedOutBooks: payload => dispatch(setCheckedOutBooks(payload)),
        setBoughtBooks: payload => dispatch(setBoughtBooks(payload)),
        setCart: payload => dispatch(setCart(payload))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Account)