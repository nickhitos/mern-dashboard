import { useGetIdentity, useOne } from "@refinedev/core";
import { Profile } from "components";

const MyProfile = () => {
	const { data: user } = useGetIdentity<{ userid: string }>();
	const { data, isLoading, isError } = useOne({
		resource: "users",
		id: user?.userid,
	});
	const myProfile = data?.data ?? [];

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>There was an error</div>;

	return (
		<Profile
			type="My"
			name={myProfile.name}
			email={myProfile.email}
			avatar={myProfile.avatar}
			properties={myProfile.allProperties}
		/>
	);
};

export default MyProfile;
