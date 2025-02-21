import { useState } from "react";
import { Button, Drawer } from "flowbite-react";

function Component() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const handleToggle = () => setIsOpen(!isOpen);

  const widgets = [
    { icon: <svg width="201px" height="35px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#006642"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 7H17M7 21V4.6C7 4.03995 7 3.75992 7.10899 3.54601C7.20487 3.35785 7.35785 3.20487 7.54601 3.10899C7.75992 3 8.03995 3 8.6 3H15.4C15.9601 3 16.2401 3 16.454 3.10899C16.6422 3.20487 16.7951 3.35785 16.891 3.54601C17 3.75992 17 4.03995 17 4.6V21M7 19H17M14 13H14.01" stroke="#" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>, label: "Find a toilet" },
    { icon: <svg fill="#006642" width="176px" height="35px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#006642" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" d="M2.68377223,9.9486833 C1.77207592,9.64478453 1.77207592,8.35521547 2.68377223,8.0513167 L20.6837722,2.0513167 C21.4655303,1.79073069 22.2092693,2.53446974 21.9486833,3.31622777 L15.9486833,21.3162278 C15.6447845,22.2279241 14.3552155,22.2279241 14.0513167,21.3162278 L11.2094306,12.7905694 L2.68377223,9.9486833 Z M6.16227766,9 L12.3162278,11.0513167 C12.6148328,11.1508517 12.8491483,11.3851672 12.9486833,11.6837722 L15,17.8377223 L19.4188612,4.58113883 L6.16227766,9 Z"></path> </g></svg>, label: "Near Me" },
    { icon: <svg width="35px" height="35x" viewBox="0 0 16.00 16.00" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#006642" stroke-width="0.00016"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.032"></g><g id="SVGRepo_iconCarrier"><path fill="#006642" fill-rule="evenodd" d="M8 .5a.75.75 0 01.67.412l2.064 4.094 4.622.662a.75.75 0 01.412 1.285l-3.335 3.18.786 4.488a.75.75 0 01-1.082.796L8 13.287l-4.137 2.13a.75.75 0 01-1.082-.796l.786-4.489-3.335-3.18a.75.75 0 01.412-1.284l4.622-.662L7.33.912A.75.75 0 018 .5zm0 2.416L6.43 6.03a.75.75 0 01-.564.405l-3.48.498 2.507 2.39a.75.75 0 01.22.672l-.594 3.396 3.138-1.616a.75.75 0 01.686 0l3.138 1.616-.595-3.396a.75.75 0 01.221-.672l2.507-2.39-3.48-.498a.75.75 0 01-.563-.405L8 2.916z" clip-rule="evenodd"></path></g></svg>, label: "My Review" },
  ];

  return (
    <>
      <div className="flex min-h-[50vh] items-center justify-center">
      <Button onClick={handleToggle}>Show swipeable drawer</Button>
    </div>

      <Drawer edge open={isOpen} onClose={handleClose} position="bottom" className="p-0">
        <div className="flex justify-center p-2">
        <button onClick={handleToggle} className="h-1 w-10 rounded bg-gray-400"></button>
        </div>
        <div className="flex justify-center p-2">
        </div>
        
        <Drawer.Items className="p-4">
          <div className="grid grid-cols-3 gap-4 p-4 lg:grid-cols-4">
            {widgets.map((widget, index) => (
              <div key={index} className="cursor-pointer rounded-lg bg-gray-50 p-4 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                <div className="mx-auto mb-2 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gray-200 p-2 dark:bg-gray-600">
                  {widget.icon}
                </div>
                <div className="text-center font-medium text-green-700 dark:text-gray-400">{widget.label}</div>
              </div>
            ))}
          </div>
        </Drawer.Items>
      </Drawer>
    </>
  );
}

export default Component;
