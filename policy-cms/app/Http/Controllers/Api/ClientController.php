<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\GicEntry;
use App\Models\LicEntry;
use App\Models\BmdsEntry;
use App\Models\MfEntry;
use App\Models\RtoEntry;
use App\Models\DropdownOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ClientController extends Controller
{
   /**
 * Display a listing of the resource.
 */
public function index(Request $request)
{
    try {
        $query = Client::with(['city', 'inqueryFor']);

        // ========== SEARCH FILTERS ==========
        // General search across multiple fields
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->search($search);
        }

        // Client name specific filter
        if ($request->has('client_name') && !empty($request->client_name)) {
            $query->where('client_name', 'like', "%{$request->client_name}%");
        }

        // Contact specific filter
        if ($request->has('contact') && !empty($request->contact)) {
            $query->where('contact', 'like', "%{$request->contact}%");
        }

        // Aadhar number filter
        if ($request->has('aadhar_no') && !empty($request->aadhar_no)) {
            $query->where('aadhar_no', 'like', "%{$request->aadhar_no}%");
        }

        // PAN number filter
        if ($request->has('pan_no') && !empty($request->pan_no)) {
            $query->where('pan_no', 'like', "%{$request->pan_no}%");
        }

        // GST number filter
        if ($request->has('gst_no') && !empty($request->gst_no)) {
            $query->where('gst_no', 'like', "%{$request->gst_no}%");
        }

        // Email filter
        if ($request->has('email') && !empty($request->email)) {
            $query->where('email', 'like', "%{$request->email}%");
        }

        // SR No filter
        if ($request->has('sr_no') && !empty($request->sr_no)) {
            $query->where('sr_no', $request->sr_no);
        }

        // Reference filter
        if ($request->has('reference') && !empty($request->reference)) {
            $query->where('reference', 'like', "%{$request->reference}%");
        }

        // ========== CLIENT INFO FILTERS ==========
        // Client type filter
        if ($request->has('client_type') && !empty($request->client_type)) {
            $query->where('client_type', $request->client_type);
        }

        // Tag filter
        if ($request->has('tag') && !empty($request->tag)) {
            $query->where('tag', $request->tag);
        }

        // City filter
        if ($request->has('city_id') && !empty($request->city_id)) {
            $query->where('city_id', $request->city_id);
        }

        // Inquery for filter
        if ($request->has('inquery_for') && !empty($request->inquery_for)) {
            $query->where('inquery_for', $request->inquery_for);
        }

        // ========== DATE RANGE FILTERS ==========
        // Entry date range filter
        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->where('date', '<=', $request->date_to);
        }

        // Month filter
        if ($request->has('month') && !empty($request->month)) {
            $month = date('m', strtotime($request->month));
            $year = date('Y', strtotime($request->month));
            $query->whereYear('date', $year)->whereMonth('date', $month);
        }

        // ========== AGE RANGE FILTERS ==========
        // Age range filter
        if ($request->has('age_from') && !empty($request->age_from)) {
            $query->where('age', '>=', $request->age_from);
        }

        if ($request->has('age_to') && !empty($request->age_to)) {
            $query->where('age', '<=', $request->age_to);
        }

        // ========== BIRTH DATE AND ANNIVERSARY FILTERS ==========
        // Birth date range filter
        if ($request->has('birth_date_from') && !empty($request->birth_date_from)) {
            $query->where('birth_date', '>=', $request->birth_date_from);
        }

        if ($request->has('birth_date_to') && !empty($request->birth_date_to)) {
            $query->where('birth_date', '<=', $request->birth_date_to);
        }

        // Anniversary date range filter
        if ($request->has('anniversary_from') && !empty($request->anniversary_from)) {
            $query->where('anniversary_dt', '>=', $request->anniversary_from);
        }

        if ($request->has('anniversary_to') && !empty($request->anniversary_to)) {
            $query->where('anniversary_dt', '<=', $request->anniversary_to);
        }

        // ========== SORTING ==========
        // Default sorting
        $sortBy = $request->has('sort_by') ? $request->sort_by : 'created_at';
        $sortOrder = $request->has('sort_order') ? $request->sort_order : 'desc';

        // Validate sort fields
        $validSortFields = [
            'date', 'sr_no', 'client_name', 'age', 'client_type', 
            'created_at', 'updated_at', 'birth_date', 'anniversary_dt'
        ];

        if (in_array($sortBy, $validSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest();
        }

        // ========== PAGINATION ==========
        $perPage = $request->has('per_page') ? min($request->per_page, 100) : 10;
        $clients = $query->paginate($perPage);

        // Transform the data to include inquery_for_value
        $transformedClients = $clients->getCollection()->transform(function ($client) {
            return [
                'id' => $client->id,
                'sr_no' => $client->sr_no,
                'date' => $client->date,
                'time' => $client->time,
                'contact' => $client->contact,
                'alt_contact' => $client->alt_contact,
                'client_type' => $client->client_type,
                'client_name' => $client->client_name,
                'tag' => $client->tag,
                'city_id' => $client->city_id,
                'inquery_for' => $client->inquery_for,
                'inquery_for_value' => $client->inqueryFor ? $client->inqueryFor->value : null,
                'birth_date' => $client->birth_date,
                'age' => $client->age,
                'anniversary_dt' => $client->anniversary_dt,
                'aadhar_no' => $client->aadhar_no,
                'pan_no' => $client->pan_no,
                'gst_no' => $client->gst_no,
                'email' => $client->email,
                'reference' => $client->reference,
                'created_at' => $client->created_at,
                'updated_at' => $client->updated_at,
                'city' => $client->city ? [
                    'id' => $client->city->id,
                    'value' => $client->city->value,
                    'category' => $client->city->category,
                ] : null,
                'inquery_for_data' => $client->inqueryFor ? [
                    'id' => $client->inqueryFor->id,
                    'value' => $client->inqueryFor->value,
                    'category' => $client->inqueryFor->category,
                ] : null,
            ];
        });

        $clients->setCollection($transformedClients);

        return response()->json([
            'success' => true,
            'data' => $clients,
            'message' => 'Clients retrieved successfully.',
            'filters' => [
                'applied' => $request->except(['page', 'per_page', 'sort_by', 'sort_order']),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Client index error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve clients.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
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

            Log::info('Client store method called', $request->all());

            $validator = Validator::make($request->all(), [
                'sr_no' => 'nullable|integer|unique:client,sr_no',
                'date' => 'required|date',
                'time' => 'required|date_format:H:i',
                'contact' => 'required|string|max:15',
                'alt_contact' => 'nullable|string|max:15',
                'client_type' => 'required|in:INDIVIDUAL,CORPORATE',
                'client_name' => 'required|string|max:255',
                'tag' => 'required|in:A,B,C',
                'city_id' => 'required|exists:dropdown_options,id',
                'inquery_for' => 'required|exists:dropdown_options,id',
                'birth_date' => 'nullable|date|before:today',
                'age' => 'nullable|integer|min:0|max:120',
                'anniversary_dt' => 'nullable|date|before:today',
                'aadhar_no' => 'nullable|string|size:12|unique:client,aadhar_no',
                'pan_no' => 'nullable|string|size:10|unique:client,pan_no',
                'gst_no' => 'nullable|string|max:15|unique:client,gst_no',
                'email' => 'nullable|email|unique:client,email',
                'reference' => 'nullable|string|max:255',
            ], [
                'aadhar_no.unique' => 'Aadhar number already exists.',
                'pan_no.unique' => 'PAN number already exists.',
                'gst_no.unique' => 'GST number already exists.',
                'email.unique' => 'Email address already exists.',
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
            
            // Calculate age from birth date if provided
            if (isset($validatedData['birth_date']) && empty($validatedData['age'])) {
                $birthDate = \Carbon\Carbon::parse($validatedData['birth_date']);
                $validatedData['age'] = $birthDate->age;
            }

            Log::info('Creating client with data:', $validatedData);

            $client = Client::create($validatedData);

            Log::info('Client created successfully', ['client_id' => $client->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $client->load(['city', 'inqueryFor']),
                'message' => 'Client created successfully.'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Client creation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create client.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
{
    try {
        $client = Client::with(['city', 'inqueryFor'])->find($id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Client not found.'
            ], 404);
        }

        // Format dates for input fields
        $formattedData = [
            'id' => $client->id,
            'sr_no' => $client->sr_no,
            'date' => $client->date ? $client->date->format('Y-m-d') : null,
            'time' => $client->time,
            'contact' => $client->contact,
            'alt_contact' => $client->alt_contact,
            'client_type' => $client->client_type,
            'client_name' => $client->client_name,
            'tag' => $client->tag,
            'city_id' => $client->city_id,
            'inquery_for' => $client->inquery_for, // This is the ID
            'inquery_for_value' => $client->inqueryFor ? $client->inqueryFor->value : null, // This is the display value
            'birth_date' => $client->birth_date ? $client->birth_date->format('Y-m-d') : null,
            'age' => $client->age,
            'anniversary_dt' => $client->anniversary_dt ? $client->anniversary_dt->format('Y-m-d') : null,
            'aadhar_no' => $client->aadhar_no,
            'pan_no' => $client->pan_no,
            'gst_no' => $client->gst_no,
            'email' => $client->email,
            'reference' => $client->reference,
        ];

        return response()->json([
            'success' => true,
            'data' => $formattedData,
            'message' => 'Client retrieved successfully.'
        ]);

    } catch (\Exception $e) {
        \Log::error('Client show error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve client.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
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

            $client = Client::find($id);

            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'sr_no' => [
                    'nullable',
                    'integer',
                    Rule::unique('client')->ignore($client->id)
                ],
                'date' => 'sometimes|date',
                'time' => 'sometimes|date_format:H:i',
                'contact' => 'sometimes|string|max:15',
                'alt_contact' => 'nullable|string|max:15',
                'client_type' => 'sometimes|in:INDIVIDUAL,CORPORATE',
                'client_name' => 'sometimes|string|max:255',
                'tag' => 'sometimes|in:A,B,C',
                'city_id' => 'sometimes|exists:dropdown_options,id',
                'inquery_for' => 'sometimes|exists:dropdown_options,id',
                'birth_date' => 'nullable|date|before:today',
                'age' => 'nullable|integer|min:0|max:120',
                'anniversary_dt' => 'nullable|date|before:today',
                'aadhar_no' => [
                    'nullable',
                    'string',
                    'size:12',
                    Rule::unique('client')->ignore($client->id)
                ],
                'pan_no' => [
                    'nullable',
                    'string',
                    'size:10',
                    Rule::unique('client')->ignore($client->id)
                ],
                'gst_no' => [
                    'nullable',
                    'string',
                    'max:15',
                    Rule::unique('client')->ignore($client->id)
                ],
                'email' => [
                    'nullable',
                    'email',
                    Rule::unique('client')->ignore($client->id)
                ],
                'reference' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();

            // Calculate age from birth date if provided
            if (isset($validatedData['birth_date']) && empty($validatedData['age'])) {
                $birthDate = \Carbon\Carbon::parse($validatedData['birth_date']);
                $validatedData['age'] = $birthDate->age;
            }

            $client->update($validatedData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $client->fresh()->load(['city', 'inqueryFor']),
                'message' => 'Client updated successfully.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Client update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update client.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
{
    try {
        DB::beginTransaction();

        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Client not found.'
            ], 404);
        }

        // Use soft delete instead of force delete
        $client->delete();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Client soft deleted successfully.'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Client delete error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete client.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}

// Add force delete method for permanent deletion
public function forceDestroy($id)
{
    try {
        DB::beginTransaction();

        $client = Client::withTrashed()->find($id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Client not found.'
            ], 404);
        }

        $client->forceDelete();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Client permanently deleted successfully.'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Client force delete error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to permanently delete client.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}

// Add restore method
public function restore($id)
{
    try {
        DB::beginTransaction();

        $client = Client::withTrashed()->find($id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Client not found.'
            ], 404);
        }

        $client->restore();

        DB::commit();

        return response()->json([
            'success' => true,
            'data' => $client->fresh()->load(['city', 'inqueryFor']),
            'message' => 'Client restored successfully.'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Client restore error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to restore client.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}

// Add method to get trashed clients
public function trashed(Request $request)
{
    try {
        $query = Client::onlyTrashed()->with(['city', 'inqueryFor']);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->search($search);
        }

        $clients = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $clients,
            'message' => 'Trashed clients retrieved successfully.'
        ]);

    } catch (\Exception $e) {
        Log::error('Trashed clients error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve trashed clients.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}



    /**
     * Get client by SR No
     */
    public function getBySrNo($srNo)
    {
        try {
            $client = Client::with(['city', 'inqueryFor'])
                ->where('sr_no', $srNo)
                ->first();

            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $client,
                'message' => 'Client retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Get client by SR No error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve client.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get clients by type
     */
    public function getByType($type)
    {
        try {
            if (!in_array(strtoupper($type), ['INDIVIDUAL', 'CORPORATE'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid client type. Must be INDIVIDUAL or CORPORATE.'
                ], 422);
            }

            $clients = Client::with(['city', 'inqueryFor'])
                ->where('client_type', strtoupper($type))
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $clients,
                'message' => "{$type} clients retrieved successfully."
            ]);

        } catch (\Exception $e) {
            Log::error('Get clients by type error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve clients by type.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get clients by tag
     */
    public function getByTag($tag)
    {
        try {
            if (!in_array(strtoupper($tag), ['A', 'B', 'C'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid tag. Must be A, B, or C.'
                ], 422);
            }

            $clients = Client::with(['city', 'inqueryFor'])
                ->where('tag', strtoupper($tag))
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $clients,
                'message' => "Tag {$tag} clients retrieved successfully."
            ]);

        } catch (\Exception $e) {
            Log::error('Get clients by tag error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve clients by tag.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }


     /**
     * Get clients by client_id
     */
    public function getClientsGic($client_id = null)
        {
            try {
                // If client_id is provided, get specific client's GIC entries
                if ($client_id) {
                    $gicEntries = GicEntry::with([
                            'client',
                            'client.city',
                            'client.inqueryFor',
                            'vehicleType',
                            'vehicle',
                            'nonmotorPolicyType',
                            'nonmotorPolicySubtype',
                            'insuranceCompany',
                        ])
                        ->where('client_id', $client_id)
                        ->latest()
                        ->get();

                    return response()->json([
                        'success' => true,
                        'data' => $gicEntries,
                        'message' => "GIC entries for client ID {$client_id} retrieved successfully."
                    ]);
                }
                
            

            } catch (\Exception $e) {
                Log::error('Get GIC entries error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve GIC entries.',
                    'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
                ], 500);
            }
    }

    public function getClientsLic($client_id = null)
        {
            try {
                // If client_id is provided, get specific client's GIC entries
                if ($client_id) {
                    $gicEntries = LicEntry::with([
                            'client',
                            'client.city',
                            'client.inqueryFor',
                        ])
                        ->where('client_id', $client_id)
                        ->latest()
                        ->get();

                    return response()->json([
                        'success' => true,
                        'data' => $gicEntries,
                        'message' => "LIC entries for client ID {$client_id} retrieved successfully."
                    ]);
                }
                
            

            } catch (\Exception $e) {
                Log::error('Get LIC entries error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve LIC entries.',
                    'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
                ], 500);
            }
    }

    public function getClientsRto($client_id = null)
        {
            try {
                // If client_id is provided, get specific client's GIC entries
                if ($client_id) {
                    $gicEntries = RtoEntry::with([
                            'client',
                            'client.city',
                            'client.inqueryFor',
                        ])
                        ->where('client_id', $client_id)
                        ->latest()
                        ->get();

                    return response()->json([
                        'success' => true,
                        'data' => $gicEntries,
                        'message' => "LIC entries for client ID {$client_id} retrieved successfully."
                    ]);
                }
                
            

            } catch (\Exception $e) {
                Log::error('Get LIC entries error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve LIC entries.',
                    'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
                ], 500);
            }
    }

    public function getClientsBmds($client_id = null)
        {
            try {
                // If client_id is provided, get specific client's GIC entries
                if ($client_id) {
                    $gicEntries = BmdsEntry::with([
                            'client',
                            'client.city',
                            'client.inqueryFor',
                        ])
                        ->where('client_id', $client_id)
                        ->latest()
                        ->get();

                    return response()->json([
                        'success' => true,
                        'data' => $gicEntries,
                        'message' => "BMDS entries for client ID {$client_id} retrieved successfully."
                    ]);
                }
                
            

            } catch (\Exception $e) {
                Log::error('Get BMDS entries error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve BMDS entries.',
                    'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
                ], 500);
            }
    }

    public function getClientsMf($client_id = null)
        {
            try {
                // If client_id is provided, get specific client's GIC entries
                if ($client_id) {
                    $gicEntries = MfEntry::with([
                            'client',
                            'client.city',
                            'client.inqueryFor',
                        ])
                        ->where('client_id', $client_id)
                        ->latest()
                        ->get();

                    return response()->json([
                        'success' => true,
                        'data' => $gicEntries,
                        'message' => "MF entries for client ID {$client_id} retrieved successfully."
                    ]);
                }
                
            

            } catch (\Exception $e) {
                Log::error('Get MF entries error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve MF entries.',
                    'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
                ], 500);
            }
    }


    public function getAllClientData($client_id)
{
    try {
        // Validate client_id
        if (!is_numeric($client_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid client ID format'
            ], 422);
        }

        // Get client basic info
        $client = Client::with(['city', 'inqueryFor'])->find($client_id);

        
        
        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Client not found'
            ], 404);
        }

        // Format client data
        $formattedClient = [
            'id' => $client->id,
            'sr_no' => $client->sr_no,
            'date' => $client->date,
            'time' => $client->time,
            'contact' => $client->contact,
            'alt_contact' => $client->alt_contact,
            'client_type' => $client->client_type,
            'client_name' => $client->client_name,
            'tag' => $client->tag,
            'city_id' => $client->city_id,
            'inquery_for' => $client->inquery_for,
            'inquery_for_value' => $client->inqueryFor ? $client->inqueryFor->value : null,
            'birth_date' => $client->birth_date,
            'age' => $client->age,
            'anniversary_dt' => $client->anniversary_dt,
            'aadhar_no' => $client->aadhar_no,
            'pan_no' => $client->pan_no,
            'gst_no' => $client->gst_no,
            'email' => $client->email,
            'reference' => $client->reference,
            'city' => $client->city ? [
                'id' => $client->city->id,
                'value' => $client->city->value,
                'category' => $client->city->category,
            ] : null,
            
        ];

        // Get all related entries from different tables
        $data = [
            'client' => $formattedClient,
            'gic_entries' => GicEntry::with([
            ])->where('client_id', $client_id)->latest()->get(),
            
            'lic_entries' => LicEntry::with([
            ])->where('client_id', $client_id)->latest()->get(),
            
            'bmds_entries' => BmdsEntry::with([
            ])->where('client_id', $client_id)->latest()->get(),
            
            'mf_entries' => MfEntry::with([
            ])->where('client_id', $client_id)->latest()->get(),
            
            'rto_entries' => RtoEntry::with([
            ])->where('client_id', $client_id)->latest()->get(),
        ];

        // Count totals
        $counts = [
            'gic_entries_count' => $data['gic_entries']->count(),
            'lic_entries_count' => $data['lic_entries']->count(),
            'bmds_entries_count' => $data['bmds_entries']->count(),
            'mf_entries_count' => $data['mf_entries']->count(),
            'rto_entries_count' => $data['rto_entries']->count(),
            'total_entries' => 
                $data['gic_entries']->count() +
                $data['lic_entries']->count() +
                $data['bmds_entries']->count() +
                $data['mf_entries']->count() +
                $data['rto_entries']->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
            'counts' => $counts,
            'message' => "All data for client ID {$client_id} retrieved successfully."
        ]);

    } catch (\Exception $e) {
        Log::error('Get all client data error for client_id ' . $client_id . ': ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve client data.',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}

    /**
     * Get dropdown options for client form
     */
    public function getClientDropdownOptions()
    {
        try {
            $options = [
                'cities' => DropdownOption::getCities(),
                'inquery_for' => DropdownOption::byCategory('inquery_types')->active()->ordered()->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $options,
                'message' => 'Client dropdown options retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Get client dropdown options error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve client dropdown options.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get statistics
     */
    public function getStats()
    {
        try {
            $totalClients = Client::count();
            $individualClients = Client::individual()->count();
            $corporateClients = Client::corporate()->count();
            
            $clientsByTag = Client::groupBy('tag')
                ->selectRaw('tag, count(*) as count')
                ->get();

            $clientsByType = Client::groupBy('client_type')
                ->selectRaw('client_type, count(*) as count')
                ->get();

            $latestSrNo = Client::max('sr_no');
            $nextSrNo = $latestSrNo ? $latestSrNo + 1 : 1001;

            // Today's birthdays and anniversaries
            $today = now()->format('m-d');
            $birthdaysToday = Client::whereRaw("DATE_FORMAT(birth_date, '%m-%d') = ?", [$today])->count();
            $anniversariesToday = Client::whereRaw("DATE_FORMAT(anniversary_dt, '%m-%d') = ?", [$today])->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_clients' => $totalClients,
                    'individual_clients' => $individualClients,
                    'corporate_clients' => $corporateClients,
                    'clients_by_tag' => $clientsByTag,
                    'clients_by_type' => $clientsByType,
                    'latest_sr_no' => $latestSrNo,
                    'next_sr_no' => $nextSrNo,
                    'birthdays_today' => $birthdaysToday,
                    'anniversaries_today' => $anniversariesToday,
                ],
                'message' => 'Statistics retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Get client statistics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get clients with birthdays/anniversaries today
     */
    public function getTodaySpecial()
    {
        try {
            $today = now()->format('m-d');
            
            $birthdayClients = Client::with(['city'])
                ->whereRaw("DATE_FORMAT(birth_date, '%m-%d') = ?", [$today])
                ->get();

            $anniversaryClients = Client::with(['city'])
                ->whereRaw("DATE_FORMAT(anniversary_dt, '%m-%d') = ?", [$today])
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'birthday_clients' => $birthdayClients,
                    'anniversary_clients' => $anniversaryClients,
                ],
                'message' => 'Today\'s special clients retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Get today special clients error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve today\'s special clients.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}