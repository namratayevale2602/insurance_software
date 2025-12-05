<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class BillController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Bill::with([
                'client',
                'client.city',
            ]);

            // Include trashed records if requested
            if ($request->has('with_trashed') && $request->with_trashed) {
                $query->withTrashed();
            }

            // Show only trashed records if requested
            if ($request->has('only_trashed') && $request->only_trashed) {
                $query->onlyTrashed();
            }

            // Search filter
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereHas('client', function($clientQuery) use ($search) {
                        $clientQuery->where('client_name', 'like', "%{$search}%")
                                  ->orWhere('contact', 'like', "%{$search}%");
                    })
                    ->orWhere('bill_number', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
                });
            }

            // Payment status filter
            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            // Client filter
            if ($request->has('client_id')) {
                $query->where('client_id', $request->client_id);
            }

            // Date range filter
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('bill_date', [$request->start_date, $request->end_date]);
            }

            // Year filter
            if ($request->has('year')) {
                $query->whereYear('bill_date', $request->year);
            }

            // Month filter
            if ($request->has('month')) {
                $month = date('m', strtotime($request->month));
                $year = date('Y', strtotime($request->month));
                $query->whereYear('bill_date', $year)->whereMonth('bill_date', $month);
            }

            $bills = $query->latest()->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $bills,
                'message' => 'Bills retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve bills.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();
            
            Log::info('Bill store method called', $request->all());

            $validator = Validator::make($request->all(), [
                'client_id' => 'required|exists:client,id',
                'items' => 'required|array|min:1',
                'items.*.description' => 'required|string|max:500',
                'items.*.quantity' => 'required|numeric|min:0.01',
                'items.*.rate' => 'required|numeric|min:0',
                'items.*.unit' => 'nullable|string|max:50',
                'tax_rate' => 'required|numeric|min:0|max:100',
                'bill_date' => 'required|date',
                'due_date' => 'nullable|date|after_or_equal:bill_date',
                'payment_status' => 'required|in:PENDING,PAID,PARTIAL,OVERDUE',
                'payment_method' => 'nullable|required_if:payment_status,PAID,PARTIAL|in:CASH,CHEQUE,ONLINE,CARD,UPI',
                'notes' => 'nullable|string',
                'terms_conditions' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();

            // Verify client exists
            $client = Client::find($validatedData['client_id']);
            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found.'
                ], 404);
            }

            // Calculate amounts for each item
            $items = $validatedData['items'];
            foreach ($items as &$item) {
                $item['amount'] = floatval($item['quantity']) * floatval($item['rate']);
            }

            // Calculate totals
            $subtotal = array_sum(array_column($items, 'amount'));
            $tax = $subtotal * ($validatedData['tax_rate'] / 100);
            $total = $subtotal + $tax;

            $billData = [
                'client_id' => $validatedData['client_id'],
                'items' => $items,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'tax_rate' => $validatedData['tax_rate'],
                'total' => $total,
                'bill_date' => $validatedData['bill_date'],
                'due_date' => $validatedData['due_date'] ?? null,
                'payment_status' => $validatedData['payment_status'],
                'payment_method' => $validatedData['payment_method'] ?? null,
                'notes' => $validatedData['notes'] ?? null,
                'terms_conditions' => $validatedData['terms_conditions'] ?? null,
            ];

            Log::info('Creating bill with data:', $billData);

            $bill = Bill::create($billData);

            Log::info('Bill created successfully', ['bill_id' => $bill->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $bill->load([
                    'client',
                    'client.city',
                ]),
                'message' => 'Bill created successfully.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Bill creation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create bill.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $bill = Bill::with([
                'client',
                'client.city',
            ])->find($id);

            if (!$bill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Bill retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve bill.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            Log::info('Update method called', ['id' => $id, 'request_data' => $request->all()]);

            // Check if request data is empty
            if (empty($request->all())) {
                Log::error('Empty request data received');
                return response()->json([
                    'success' => false,
                    'message' => 'No data provided for update.'
                ], 400);
            }

            $bill = Bill::find($id);

            if (!$bill) {
                Log::error('Bill not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            Log::info('Found bill', ['bill' => $bill->toArray()]);

            $validator = Validator::make($request->all(), [
                'client_id' => 'sometimes|exists:client,id',
                'items' => 'sometimes|array|min:1',
                'items.*.description' => 'required_with:items|string|max:500',
                'items.*.quantity' => 'required_with:items|numeric|min:0.01',
                'items.*.rate' => 'required_with:items|numeric|min:0',
                'items.*.unit' => 'nullable|string|max:50',
                'tax_rate' => 'sometimes|numeric|min:0|max:100',
                'bill_date' => 'sometimes|date',
                'due_date' => 'nullable|date|after_or_equal:bill_date',
                'payment_status' => 'sometimes|in:PENDING,PAID,PARTIAL,OVERDUE',
                'payment_method' => 'nullable|required_if:payment_status,PAID,PARTIAL|in:CASH,CHEQUE,ONLINE,CARD,UPI',
                'notes' => 'nullable|string',
                'terms_conditions' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();
            Log::info('Validated data', $validatedData);

            // Update items with calculated amounts if items are provided
            if (isset($validatedData['items'])) {
                $items = $validatedData['items'];
                foreach ($items as &$item) {
                    $item['amount'] = floatval($item['quantity']) * floatval($item['rate']);
                }
                $validatedData['items'] = $items;
            }

            Log::info('Data before update', $validatedData);
            
            $updated = $bill->update($validatedData);
            
            Log::info('Update result', ['updated' => $updated, 'bill_after' => $bill->fresh()->toArray()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $bill->fresh()->load([
                    'client',
                    'client.city',
                ]),
                'message' => 'Bill updated successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update bill.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage (Soft Delete).
     */
    public function destroy($id)
    {
        try {
            $bill = Bill::find($id);

            if (!$bill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            $bill->delete();

            return response()->json([
                'success' => true,
                'message' => 'Bill deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete bill.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft deleted bill.
     */
    public function restore($id)
    {
        try {
            $bill = Bill::withTrashed()->find($id);

            if (!$bill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            if (!$bill->trashed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill is not deleted.'
                ], 400);
            }

            $bill->restore();

            return response()->json([
                'success' => true,
                'data' => $bill->fresh()->load([
                    'client',
                    'client.city',
                ]),
                'message' => 'Bill restored successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore bill.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete a bill.
     */
    public function forceDelete($id)
    {
        try {
            $bill = Bill::withTrashed()->find($id);

            if (!$bill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            $bill->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Bill permanently deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete bill.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bill by bill number
     */
    public function getByBillNumber($billNumber)
    {
        try {
            $bill = Bill::with([
                'client',
                'client.city',
            ])
                ->where('bill_number', $billNumber)
                ->first();

            if (!$bill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Bill retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve bill.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark bill as paid
     */
    public function markAsPaid(Request $request, $id)
    {
        try {
            $bill = Bill::find($id);

            if (!$bill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'payment_method' => 'required|in:CASH,CHEQUE,ONLINE,CARD,UPI',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $bill->markAsPaid($request->payment_method);

            return response()->json([
                'success' => true,
                'data' => $bill->fresh()->load([
                    'client',
                    'client.city',
                ]),
                'message' => 'Bill marked as paid successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark bill as paid.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark bill as partial
     */
    public function markAsPartial(Request $request, $id)
    {
        try {
            $bill = Bill::find($id);

            if (!$bill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'payment_method' => 'required|in:CASH,CHEQUE,ONLINE,CARD,UPI',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $bill->markAsPartial($request->payment_method);

            return response()->json([
                'success' => true,
                'data' => $bill->fresh()->load([
                    'client',
                    'client.city',
                ]),
                'message' => 'Bill marked as partial payment.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark bill as partial.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics
     */
    public function getStats()
    {
        try {
            $totalBills = Bill::count();
            $pendingBills = Bill::pending()->count();
            $paidBills = Bill::paid()->count();
            $overdueBills = Bill::overdue()->count();
            $partialBills = Bill::partial()->count();
            $deletedBills = Bill::onlyTrashed()->count();
            
            $totalAmount = Bill::sum('total');
            $pendingAmount = Bill::pending()->sum('total');
            $paidAmount = Bill::paid()->sum('total');
            $overdueAmount = Bill::overdue()->sum('total');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_bills' => $totalBills,
                    'pending_bills' => $pendingBills,
                    'paid_bills' => $paidBills,
                    'overdue_bills' => $overdueBills,
                    'partial_bills' => $partialBills,
                    'deleted_bills' => $deletedBills,
                    'total_amount' => $totalAmount,
                    'pending_amount' => $pendingAmount,
                    'paid_amount' => $paidAmount,
                    'overdue_amount' => $overdueAmount,
                ],
                'message' => 'Statistics retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bills by client
     */
    public function getByClient($clientId)
    {
        try {
            $bills = Bill::with([
                'client',
                'client.city',
            ])
                ->where('client_id', $clientId)
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $bills,
                'message' => 'Client bills retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve client bills.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add item to bill
     */
    public function addItem(Request $request, $id)
    {
        try {
            $bill = Bill::find($id);

            if (!$bill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'description' => 'required|string|max:500',
                'quantity' => 'required|numeric|min:0.01',
                'rate' => 'required|numeric|min:0',
                'unit' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $bill->addItem(
                $request->description,
                $request->quantity,
                $request->rate,
                $request->unit
            );

            return response()->json([
                'success' => true,
                'data' => $bill->fresh()->load([
                    'client',
                    'client.city',
                ]),
                'message' => 'Item added to bill successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to bill.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from bill
     */
    public function removeItem($id, $itemIndex)
    {
        try {
            $bill = Bill::find($id);

            if (!$bill) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bill not found.'
                ], 404);
            }

            $bill->removeItem($itemIndex);

            return response()->json([
                'success' => true,
                'data' => $bill->fresh()->load([
                    'client',
                    'client.city',
                ]),
                'message' => 'Item removed from bill successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from bill.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}