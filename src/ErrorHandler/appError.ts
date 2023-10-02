interface AppErrorProps {
    statusCode: number;
    isOperational: boolean;
}
class AppError extends Error implements AppErrorProps{
    constructor(message:string, statusCode:number){
        super(message)
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4')? 'fail': 'app error';
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)
    }
    statusCode: number;
    status: string;
    isOperational: boolean;
}

module.exports = AppError