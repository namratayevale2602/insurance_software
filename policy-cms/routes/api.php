<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\GicEntryController;
use App\Http\Controllers\Api\LicEntryController;
use App\Http\Controllers\Api\RtoEntryController;
use App\Http\Controllers\Api\BmdsEntryController;
use App\Http\Controllers\Api\MfEntryController;
use App\Http\Controllers\Api\ExpenseEntryController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\SetGoalController;
use App\Http\Controllers\Api\ThoughtController;
use App\Http\Controllers\Api\DropdownOptionController;
use App\Http\Controllers\Api\TodoEntryController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/check-auth', [AuthController::class, 'checkAuth']);
Route::get('/csrf-token', [AuthController::class, 'getCsrfToken']);


// Protected routes - using custom middleware
Route::middleware([\App\Http\Middleware\SanctumCookieAuth::class])->group(function () {
    
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/user', [AuthController::class, 'user']);
    
    
    // Admin routes
    Route::middleware([\App\Http\Middleware\AdminMiddleware::class])->group(function () {
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::get('/admin/stats', [AdminController::class, 'getStats']);
        Route::post('/admin/users', [AdminController::class, 'createUser']);
        Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    });

    // Additional custom routes

    // Clients Routes
    Route::post('/createclient', [ClientController::class, 'store']);
    Route::put('/updateclient/{id}', [ClientController::class, 'update']);
    Route::delete('/deleteclient/{id}', [ClientController::class, 'destroy']);
    Route::get('/clients', [ClientController::class, 'index']);
    Route::get('/clients/{id}', [ClientController::class, 'show']);

    Route::get('gic-entries/{client_id}', [ClientController::class, 'getClientsGic']);
    Route::get('lic-entries/{client_id}', [ClientController::class, 'getClientsLic']);
    Route::get('rto-entries/{client_id}', [ClientController::class, 'getClientsRto']);
    Route::get('bmds-entries/{client_id}', [ClientController::class, 'getClientsBmds']);
    Route::get('mf-entries/{client_id}', [ClientController::class, 'getClientsMf']);
    Route::get('getalldata/{client_id}', [ClientController::class, 'getAllClientData']);

    Route::get('clients/sr-no/{sr_no}', [ClientController::class, 'getBySrNo']);
    Route::get('clients/type/{type}', [ClientController::class, 'getByType']);
    Route::get('clients/tag/{tag}', [ClientController::class, 'getByTag']);
    Route::get('clients/stats/statistics', [ClientController::class, 'getStats']);

    // Routes for cities and inqueries
    Route::get('cities', function () {
        return response()->json([
            'success' => true,
            'data' => \App\Models\City::all()
        ]);
    });



    // GIC Entries Routes
    Route::post('/creategic', [GicEntryController::class, 'store']);
    Route::put('/updategic/{id}', [GicEntryController::class, 'update']);
    Route::delete('/deletegic/{id}', [GicEntryController::class, 'destroy']);
    Route::get('/gicEntries', [GicEntryController::class, 'index']);
    Route::get('/gicEntries/{id}', [GicEntryController::class, 'show']);

    Route::get('gic-entries/reg-num/{regNum}', [GicEntryController::class, 'getByRegNum']);
    Route::get('gic-entries/policy-num/{policyNum}', [GicEntryController::class, 'getByPolicyNum']);
    Route::get('gic-entries/client/{clientId}', [GicEntryController::class, 'getByClient']);
    Route::get('gic-entries/stats', [GicEntryController::class, 'getStats']);

    Route::get('/gicEntries/filter-stats', [GicEntryController::class, 'getFilterStats']);

    // LIC Entries Routes

    Route::post('/createlic', [LicEntryController::class, 'store']);
    Route::put('/updatelic/{id}', [LicEntryController::class, 'update']);
    Route::delete('/deletelic/{id}', [LicEntryController::class, 'destroy']);
    Route::get('/licEntries', [LicEntryController::class, 'index']);
    Route::get('/licEntries/{id}', [LicEntryController::class, 'show']);

    Route::get('lic-entries/reg-num/{regNum}', [LicEntryController::class, 'getByRegNum']);
    Route::get('lic-entries/policy-num/{policyNum}', [LicEntryController::class, 'getByPolicyNum']);
    Route::get('lic-entries/client/{clientId}', [LicEntryController::class, 'getByClient']);
    Route::get('lic-entries/stats', [LicEntryController::class, 'getStats']);

    // RTO Entries Routes

    Route::post('/createRto', [RtoEntryController::class, 'store']);
    Route::put('/updateRto/{id}', [RtoEntryController::class, 'update']);
    Route::delete('/deleteRto/{id}', [RtoEntryController::class, 'destroy']);
    Route::get('/RtoEntries', [RtoEntryController::class, 'index']);
    Route::get('/rtoEntries/{id}', [RtoEntryController::class, 'show']);


     // BMDS Entries Routes

    Route::post('/createBmds', [BmdsEntryController::class, 'store']);
    Route::put('/updateBmds/{id}', [BmdsEntryController::class, 'update']);
    Route::delete('/deleteBmds/{id}', [BmdsEntryController::class, 'destroy']);
    Route::get('/BmdsEntries', [BmdsEntryController::class, 'index']);
    Route::get('/bmdsEntries/{id}', [BmdsEntryController::class, 'show']);

     // MF Entries Routes

    Route::post('/createMf', [MfEntryController::class, 'store']);
    Route::put('/updateMf/{id}', [MfEntryController::class, 'update']);
    Route::delete('/deleteMf/{id}', [MfEntryController::class, 'destroy']);
    Route::get('/MfEntries', [MfEntryController::class, 'index']);
    Route::get('/mfEntries/{id}', [MfEntryController::class, 'show']);

    // Expense Entries Routes

    Route::post('/createExpense', [ExpenseEntryController::class, 'store']);
    Route::put('/updateExpense/{id}', [ExpenseEntryController::class, 'update']);
    Route::delete('/deleteExpense/{id}', [ExpenseEntryController::class, 'destroy']);
    Route::get('/ExpenseEntries', [ExpenseEntryController::class, 'index']);

    // Bills Entries Routes

    Route::post('/createBill', [BillController::class, 'store']);
    Route::put('/updateBill/{id}', [BillController::class, 'update']);
    Route::delete('/deleteBill/{id}', [BillController::class, 'destroy']);
    Route::get('/BillEntries', [BillController::class, 'index']);


     // To Do Entries Routes

    Route::post('/createToDo', [TodoEntryController::class, 'store']);
    Route::put('/updateToDo/{id}', [TodoEntryController::class, 'update']);
    Route::delete('/deleteToDo/{id}', [TodoEntryController::class, 'destroy']);
    Route::get('/ToDoEntries', [TodoEntryController::class, 'index']);


    // Dropdowns Entries Routes

    Route::post('/createDropdown', [DropdownOptionController::class, 'store']);
    Route::put('/updateDropdown/{id}', [DropdownOptionController::class, 'update']);
    Route::delete('/deleteDropdown/{id}', [DropdownOptionController::class, 'destroy']);
    Route::get('/DropdownEntries', [DropdownOptionController::class, 'index']);
    

    // SetGoal Entries Routes

    Route::post('/createSetGoal', [SetGoalController::class, 'store']);
    Route::put('/updateSetGoal/{id}', [SetGoalController::class, 'update']);
    Route::delete('/deleteSetGoal/{id}', [SetGoalController::class, 'destroy']);
    Route::get('/SetGoalEntries', [SetGoalController::class, 'index']);

    // Thought Entries Routes

    Route::post('/createThought', [ThoughtController::class, 'store']);
    Route::put('/updateThought/{id}', [ThoughtController::class, 'update']);
    Route::delete('/deleteThought/{id}', [ThoughtController::class, 'destroy']);
    Route::get('/ThoughtEntries', [ThoughtController::class, 'index']);

});


