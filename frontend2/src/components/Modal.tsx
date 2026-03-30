const Modal = ({modalData,closeModal}:any) => {
    // const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="flex items-center just-center h-screen" style={{position:"fixed"}}>
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-2">{modalData.line}</h2>
                        <div className="flex items-center mb-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                            <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${modalData.probability}` }}
                            />
                        </div>
                        <span className="ml-2 text-sm">{modalData.probability}</span>
                        </div>
                        <p className="text-gray-600 mb-4">{modalData.sources}</p>
                        <h4 className='text-md font-bold mb-2'><p>{modalData.Url}</p></h4>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md"
                            onClick={() => closeModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
        </div>
    );
};

export default Modal;