Test 01 - Register/Signup
    Register as user
        Data 
            email:- test1@gmail.com
            password:- test@123
        result - Success
        issues
            No required field indicators - fixed
            No real time password did not matching option - fixed
        
    Register as Business
        Data
            email:- test1@gmail.com
            password:- test@123
        result - Error
        issue
            email availability check failed - fixed 

Test 02 - Login
    Login as user
        Data
            email:- test1@gmail.com
            password:- test#123
        result - Invalid cred
        issue
            Show 2 errors(need handle them)
    
    Login as user
        Data 
            email:- test1@gmail.com
            password:- test@123
        results - Login success but got error
            Error fetching favorites: [Error [FirebaseError]: Missing or insufficient permissions.]  
        issue
            Firebase error in favourite collection
            No redirecting

    Login as Business
        Data
            email:-nalakadinesh97@gmail.com
            password:-*******
        results - Login success and error got same time
        issue
            issue with favourite collection
            No redirecting to business dashboard