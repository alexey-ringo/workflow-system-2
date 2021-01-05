<?php


namespace App\Http\Controllers\Api;


use App\ApiCode;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login']]);
    }

    public function login() {
        $credentials = request()->validate(['email' => 'required|email', 'password' => 'required|string|max:25']);

        if (! $token = auth('api')->attempt($credentials)) {
            return $this->respondUnAuthorizedRequest(ApiCode::INVALID_CREDENTIALS);
        }

        return $this->respondWithToken($token);
    }

    private function respondWithToken($token) {
        return $this->respond([
            'token' => $token,
            'access_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60
        ], "Login Successful");
    }


    public function logout() {
        auth()->logout();
        return $this->respondWithMessage('User successfully logged out');
    }


    public function refresh() {
        return $this->respondWithToken(auth('api')->refresh());
    }

    public function me() {
        return $this->respond(auth()->user());
    }

}
