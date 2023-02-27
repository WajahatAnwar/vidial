<!DOCTYPE html>
<html>
<head>
    <title>Reminder Order Mail</title>
</head>
<body>
    <h1>{{ $details['title'] }}</h1>
    <p>{{ $details['body'] }}</p>
    <a href="{{ route('review_updated' ,['id' => $details['id']]) }}">Update Review</a>
    <p>Need a Review</p>
</body>
</html>
