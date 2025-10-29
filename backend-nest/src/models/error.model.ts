export class ErrorResponse {
  statusCode: number;
  message: string; //yang ditampilkan toast
  error?: string; //detail dari mesin
}

export class SimpleSuccess {
  statusCode: number;
  message: string;
}
