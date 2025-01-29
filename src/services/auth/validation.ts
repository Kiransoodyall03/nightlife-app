export const validateEmail = (email: string): boolean => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };
  
  export const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };
  
  export const validateUsername = (username: string): boolean => {
    return username.length >= 3;
  };