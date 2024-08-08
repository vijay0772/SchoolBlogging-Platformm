// src/utils/localStorageUtils.js

export const getUserDataFromLocalStorage = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : [];
};

export const saveUserDataToLocalStorage = (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
};

export const getPostDataFromLocalStorage = () => {
    const postData = localStorage.getItem('postData');
    return postData ? JSON.parse(postData) : [];
};

export const savePostDataToLocalStorage = (postData) => {
    localStorage.setItem('postData', JSON.stringify(postData));
};

//

