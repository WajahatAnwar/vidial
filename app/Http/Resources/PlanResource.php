<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'capped_amount' => $this->capped_amount,
            'created_at' => $this->created_at,
            'description' => $this->description,
            'video_description' => $this->getVideoDescription($this->name),
            'email_description'=>$this->getEmailDescription($this->name),
            'id' => $this->id,
            'interval' => $this->interval,
            'name' => $this->name,
            'on_install' => $this->on_install,
            'price' => $this->price,
            'terms' => $this->terms,
            'test' => $this->test,
            'trial_days' => $this->trial_days,
            'type' => $this->type,
            'ugc_email_count' => $this->ugc_email_count,
            'ugc_video_count' => $this->ugc_video_count,
            'updated_at' => $this->updated_at
        ];
    }

    /**
     * Get video description based on the plan name.
     *
     * @param  string  $name
     * @return string
     */
    private function getVideoDescription($name)
    {
        if ($name == 'Standard' || $name == 'Premium') {
            return 'Unlimited videos';
        }

        return 'Limited videos';
    }
    /**
     * Get Email description based on the plan name.
     *
     * @param  string  $name
     * @return string
     */
    private function getEmailDescription($name)
    {
        if ($name == 'Standard' || $name == 'Premium') {
            return 'Unlimited emails';
        }

        return 'Limited emails';
    }
}
