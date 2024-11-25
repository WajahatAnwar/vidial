<?php

namespace App\Http\Controllers\Racoon;

use Illuminate\Http\Request;
use App\Models\AllInOne\User;
use App\Models\Racoon\Restriction;
use App\Mail\Racoon\FraudOrderMail;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;
use App\Http\Requests\Racoon\RestrictionRequest;

class RestrictionController extends Controller
{
    public function index(Request $request)
    {
        return inertia('Applications/Racoon/Listing/Listing', [
            'users' => User::all()
        ]);
    }
    
    public function restrictionsList(Request $request)
    {
        $restrictions = Restriction::with(['user', 'emails', 'tags', 'collections'])->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) {
                $q->where('name', 'like', '%' . request()->get('q') . '%')
                    ->orWhereHas('user', function ($q) {
                        $q->where('name', 'like', '%' . request()->get('q') . '%');
                    })->orWhereHas('emails', function ($q) {
                        $q->where('email', 'like', '%' . request()->get('q') . '%');
                    })->orWhereHas('tags', function ($q) {
                        $q->where('tag', 'like', '%' . request()->get('q') . '%');
                    })->orWhereHas('collections', function ($q) {
                        $q->where('handle', 'like', '%' . request()->get('q') . '%');
                    });
                });
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->cursorPaginate($request->page_count);

        return responseJson(true, 'Restrictions retrieved successfully!', $restrictions);
    }

    public function create(Request $request)
    {
        return inertia('Applications/Racoon/Restrictions/Restrictions', [
            'users' => User::all(),
        ]);
    }

    public function store(RestrictionRequest $request)
    {
        $input = $request->all();
        $input['user_id'] = $request->user['value'];
        $restriction = Restriction::create($input);

        $emails = array_map(function ($email) {
            return ['email' => $email];
        }, $request->emails);
        $restriction->emails()->createMany($emails);

        $tags = array_map(function ($tag) {
            return ['tag' => $tag];
        }, $request->tags);
        $restriction->tags()->createMany($tags);

        $collections = array_map(function ($collection) {
            return [
                'handle' => $collection['value'],
                'title' => $collection['label']
            ];
        }, $request->collections);
        $restriction->collections()->createMany($collections);

        return responseJson(true, 'Restriction created successfully!', null);
    }

    public function collectionsList(User $user)
    {
        try {
            $query = <<<GRAPHQL
            query {
                collections(first: 250) {
                    edges {
                        node {
                            handle
                            title
                        }
                    }
                }
            }
            GRAPHQL;
            
            $response = $user->api()->graph($query);

            $collections = [];

            if (!empty($response['body']['data']['collections']['edges'])) {
                foreach ($response['body']['data']['collections']['edges'] as $edge) {
                    $node = $edge['node'];
                    $collections[] = [
                        'value' => $node['handle'],
                        'label' => $node['title']
                    ];
                }

                if (!empty($collections)) {
                    return responseJson(true, 'Collections retrieved successfully!', $collections);
                }
            }

            return responseJson(false, 'No collections found!', null);
        } catch (\Exception $e) {
            logger()->error('Error fetching collections: ' . $e->getMessage());
            return responseJson(false, 'Error fetching collections!', null);
        }
    }

    public function update(RestrictionRequest $request, Restriction $restriction)
    {
        $input = $request->all();
        $input['user_id'] = $request->user['value'];
        $restriction->update($input);

        $emails = array_map(function ($email) {
            return ['email' => $email];
        }, $request->emails);
        $restriction->emails()->delete();
        $restriction->emails()->createMany($emails);

        $tags = array_map(function ($tag) {
            return ['tag' => $tag];
        }, $request->tags);
        $restriction->tags()->delete();
        $restriction->tags()->createMany($tags);

        $collections = array_map(function ($collection) {
            return [
                'handle' => $collection['value'],
                'title' => $collection['label']
            ];
        }, $request->collections);
        $restriction->collections()->delete();
        $restriction->collections()->createMany($collections);

        return responseJson(true, 'Restriction updated successfully!', null);
    }

    public function destroy(Restriction $restriction)
    {
        $restriction->emails()->delete();
        $restriction->tags()->delete();
        $restriction->collections()->delete();
        $restriction->delete();
        return responseJson(true, 'Restriction deleted successfully!', null);
    }

    public function sendFraudOrderEmail(Request $request)
    {
        $data = [
            'subject' => 'Fraud Order Test Email',
            'order_name' => '#1234567890',
            'body' => 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nemo fugiat commodi dolor a tenetur sapiente neque saepe debitis minima inventore! Voluptas ut pariatur at minus tenetur voluptatem quidem officiis dolores!',
            'email' => 'zillemuhammad.jafary@gmail.com',
            'name' => 'zmjafary',
        ];

        $message = (new FraudOrderMail($data))->onQueue('que_orders');
        Mail::to($data['email'])->queue($message);
        return sendResponse(true, 'Email Sent Successfully!');
    }
}
