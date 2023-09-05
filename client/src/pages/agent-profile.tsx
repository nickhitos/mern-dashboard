import { useOne } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Profile } from "components";

const AgentProfile = () => {
	const { id } = useParams();
	const { data, isLoading, isError } = useOne({
		resource: "users",
		id: id as string,
	});
	const myProfile = data?.data ?? [];

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>There was an error</div>;

	return (
		<Profile
			type="Agent"
			name={myProfile.name}
			email={myProfile.email}
			avatar={myProfile.avatar}
			properties={myProfile.allProperties}
		/>
	);
};

export default AgentProfile;
