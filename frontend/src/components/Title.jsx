import { Avatar } from 'primereact/avatar';

export function Title(props) {
	const { title, subTitle, iconClass = '', headerClass = "pb-2", titleClass = "font-bold text-lg", subTitleClass = "text-sm text-500", iconRight = false, avatarSize="large", avatarClass="", separator = true } = props;
	let rowClass = "flex items-center";
	if (iconRight) {
		rowClass += " justify-between";
	}
	return (
		<>
			<div className={headerClass}>
				<div className={rowClass}>
					{(iconClass && !iconRight) &&
						<div className="mr-2">
							<Avatar size={avatarSize} className={avatarClass} icon={iconClass} />
						</div>
					}
					<div>
						<div className={titleClass}>{title}</div>
						{subTitle && <div className={subTitleClass}>{subTitle}</div>}
					</div>

					{(iconClass && iconRight) &&
						<div className="ml-2">
							<Avatar size={avatarSize} className={avatarClass} icon={iconClass} />
						</div>
					}
				</div>
			</div>
			{separator && <hr className="my-2" />}
		</>
	);
}